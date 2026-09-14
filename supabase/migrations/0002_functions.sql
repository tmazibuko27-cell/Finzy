-- Server-authoritative feed, quiz scoring, XP/streak/level, and account deletion.
-- All SECURITY DEFINER functions validate against auth.uid() internally so a
-- client can never award itself XP, alter another user's data, or read drafts.

create table user_interests (
  user_id uuid not null references profiles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);
alter table user_interests enable row level security;
create policy "user_interests_all_own" on user_interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- LEVEL CURVE
-- ============================================================

create or replace function public.level_for_xp(p_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(sqrt(greatest(p_xp, 0)::numeric / 25))::integer + 1);
$$;

-- ============================================================
-- FEED
-- ============================================================

create or replace function public.get_feed(
  p_cursor text default null,
  p_limit integer default 6,
  p_session_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user uuid := auth.uid();
  v_offset integer := coalesce(p_cursor::integer, 0);
  v_rows jsonb;
begin
  if p_limit is null or p_limit <= 0 or p_limit > 25 then
    p_limit := 6;
  end if;

  with scored as (
    select
      c.id, c.type, c.eyebrow, c.hook, c.body, c.image_url, c.difficulty,
      c.estimated_seconds, c.story_sequence, c.story_total,
      (
        2.0 * c.quality_score
        + case when v_user is not null and exists (
            select 1 from card_topics ct
            join user_interests ui on ui.topic_id = ct.topic_id and ui.user_id = v_user
            where ct.card_id = c.id
          ) then 3.0 else 0 end
        + case when v_user is not null and exists (
            select 1 from card_entities ce
            join follows f on f.target_type::text = ce.entity_type::text and f.target_id = ce.entity_id
            where ce.card_id = c.id and f.user_id = v_user
          ) then 3.0 else 0 end
        + case when v_user is not null and exists (
            select 1 from card_topics ct
            join topic_mastery tm on tm.topic_id = ct.topic_id and tm.user_id = v_user
            where ct.card_id = c.id and tm.score < 50
          ) then 2.0 else 0 end
        + random() * 0.5
        - case when v_user is not null and exists (
            select 1 from user_card_events uce
            where uce.card_id = c.id and uce.user_id = v_user
              and uce.created_at > now() - interval '2 days'
          ) then 5.0 else 0 end
      ) as score
    from cards c
    where c.status = 'published'
  ),
  page as (
    select * from scored order by score desc, id offset v_offset limit p_limit
  ),
  entities as (
    select ce.card_id,
      jsonb_agg(jsonb_build_object(
        'type', ce.entity_type,
        'slug', coalesce(p.slug, co.slug, t.slug),
        'name', coalesce(p.name, co.name, t.name)
      )) as entities
    from card_entities ce
    left join people p on ce.entity_type = 'person' and p.id = ce.entity_id
    left join companies co on ce.entity_type = 'company' and co.id = ce.entity_id
    left join topics t on ce.entity_type = 'topic' and t.id = ce.entity_id
    where ce.card_id in (select id from page)
    group by ce.card_id
  ),
  primary_topic as (
    select distinct on (ct.card_id) ct.card_id, ct.topic_id
    from card_topics ct
    where ct.card_id in (select id from page)
    order by ct.card_id
  ),
  sources_count as (
    select cs.card_id, count(*) as source_count
    from card_sources cs
    where cs.card_id in (select id from page)
    group by cs.card_id
  ),
  quiz as (
    select q.card_id,
      jsonb_build_object(
        'questionId', q.id, 'questionVersion', q.version, 'prompt', q.prompt,
        'type', q.type, 'difficulty', q.difficulty, 'xpReward', q.xp_reward,
        'numericUnit', q.numeric_unit,
        'options', (
          select jsonb_agg(jsonb_build_object('id', qo.id, 'label', qo.label) order by qo.sort_order)
          from question_options qo where qo.question_id = q.id
        )
      ) as quiz
    from questions q
    where q.card_id in (select id from page) and q.status = 'published'
  ),
  saved as (
    select b.card_id from bookmarks b
    where v_user is not null and b.user_id = v_user and b.card_id in (select id from page)
  ),
  followed as (
    select pt.card_id from primary_topic pt
    join follows f on f.target_type = 'topic' and f.target_id = pt.topic_id
    where v_user is not null and f.user_id = v_user
  )
  select jsonb_agg(
    jsonb_build_object(
      'id', page.id, 'type', page.type, 'eyebrow', page.eyebrow, 'hook', page.hook,
      'body', page.body, 'imageUrl', page.image_url, 'difficulty', page.difficulty,
      'estimatedSeconds', page.estimated_seconds, 'storySequence', page.story_sequence,
      'storyTotal', page.story_total,
      'entities', coalesce(entities.entities, '[]'::jsonb),
      'sourceCount', coalesce(sources_count.source_count, 0),
      'isSaved', exists (select 1 from saved where saved.card_id = page.id),
      'isFollowingPrimaryTopic', exists (select 1 from followed where followed.card_id = page.id),
      'quiz', quiz.quiz
    ) order by page.score desc
  ) into v_rows
  from page
  left join entities on entities.card_id = page.id
  left join primary_topic on primary_topic.card_id = page.id
  left join sources_count on sources_count.card_id = page.id
  left join quiz on quiz.card_id = page.id;

  return jsonb_build_object(
    'cards', coalesce(v_rows, '[]'::jsonb),
    'nextCursor', case
      when jsonb_array_length(coalesce(v_rows, '[]'::jsonb)) < p_limit then null
      else (v_offset + p_limit)::text
    end
  );
end;
$$;

grant execute on function public.get_feed(text, integer, text) to authenticated, anon;

-- ============================================================
-- STREAK
-- ============================================================

create or replace function public.recompute_streak(p_user uuid, p_xp_today integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz text;
  v_today date;
  v_last date;
begin
  select timezone into v_tz from profiles where id = p_user;
  v_today := (now() at time zone coalesce(v_tz, 'UTC'))::date;

  select last_streak_date into v_last from profiles where id = p_user;

  if p_xp_today < 10 then
    return;
  end if;

  if v_last = v_today then
    return; -- already counted today
  elsif v_last = v_today - 1 then
    update profiles
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_streak_date = v_today
      where id = p_user;
  else
    update profiles
      set current_streak = 1,
          longest_streak = greatest(longest_streak, 1),
          last_streak_date = v_today
      where id = p_user;
  end if;
end;
$$;

-- ============================================================
-- QUIZ SUBMISSION
-- ============================================================

create or replace function public.submit_quiz_answer(
  question_id uuid,
  question_version integer,
  selected_option_id uuid default null,
  numeric_response numeric default null,
  idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_question questions%rowtype;
  v_correct boolean;
  v_correct_option uuid;
  v_already_answered boolean;
  v_xp_reason xp_reason;
  v_xp integer := 0;
  v_today_xp integer;
  v_total_xp integer;
  v_level integer;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;
  if idempotency_key is null then
    raise exception 'idempotency_key required';
  end if;

  select * into v_question from questions where id = question_id and status = 'published';
  if v_question is null then
    raise exception 'Question not found';
  end if;

  select exists (
    select 1 from user_answers
    where user_id = v_user and user_answers.question_id = submit_quiz_answer.question_id
      and user_answers.question_version = submit_quiz_answer.question_version
      and user_answers.idempotency_key = submit_quiz_answer.idempotency_key
  ) into v_already_answered;

  if v_question.type = 'numeric' then
    v_correct := numeric_response is not null
      and v_question.numeric_answer is not null
      and abs(numeric_response - v_question.numeric_answer) <= coalesce(v_question.numeric_tolerance, 0);
  else
    select qo.id, qo.is_correct into v_correct_option, v_correct
    from question_options qo
    where qo.question_id = submit_quiz_answer.question_id and qo.id = selected_option_id;
    v_correct := coalesce(v_correct, false);
    select qo.id into v_correct_option from question_options qo
      where qo.question_id = submit_quiz_answer.question_id and qo.is_correct limit 1;
  end if;

  if not v_already_answered then
    insert into user_answers (user_id, question_id, question_version, selected_option_id, numeric_response, correct, idempotency_key)
    values (v_user, question_id, question_version, selected_option_id, numeric_response, v_correct, idempotency_key)
    on conflict do nothing;

    if v_correct then
      v_xp_reason := case v_question.difficulty
        when 1 then 'quiz_correct_easy'
        when 2 then 'quiz_correct_medium'
        else 'quiz_correct_hard'
      end;
      v_xp := v_question.xp_reward;

      insert into xp_ledger (user_id, reason, amount, reference_id, idempotency_key)
      values (v_user, v_xp_reason, v_xp, question_id, idempotency_key)
      on conflict do nothing;

      update profiles set total_xp = total_xp + v_xp, updated_at = now() where id = v_user;

      -- Adaptive mastery: correct answers nudge the topic score up, wrong answers down slightly.
      insert into topic_mastery (user_id, topic_id, score)
      select v_user, qt.topic_id, 50 + (v_question.difficulty * 5)
      from question_topics qt where qt.question_id = submit_quiz_answer.question_id
      on conflict (user_id, topic_id) do update
        set score = least(100, topic_mastery.score + (v_question.difficulty * 5)), updated_at = now();
    else
      insert into topic_mastery (user_id, topic_id, score)
      select v_user, qt.topic_id, 45
      from question_topics qt where qt.question_id = submit_quiz_answer.question_id
      on conflict (user_id, topic_id) do update
        set score = greatest(0, topic_mastery.score - 3), updated_at = now();
    end if;

    select coalesce(sum(amount), 0) into v_today_xp
    from xp_ledger
    where user_id = v_user
      and created_at >= date_trunc('day', now() at time zone (select timezone from profiles where id = v_user));

    perform public.recompute_streak(v_user, v_today_xp);
  end if;

  select total_xp into v_total_xp from profiles where id = v_user;
  v_level := public.level_for_xp(v_total_xp);
  update profiles set level = v_level where id = v_user and level is distinct from v_level;

  return jsonb_build_object(
    'correct', v_correct,
    'explanation', v_question.explanation,
    'correctOptionId', v_correct_option,
    'xpAwarded', case when v_already_answered then 0 else v_xp end,
    'totalXp', v_total_xp,
    'level', v_level
  );
end;
$$;

grant execute on function public.submit_quiz_answer(uuid, integer, uuid, numeric, text) to authenticated;

-- ============================================================
-- ACCOUNT DELETION (soft marker; the Edge Function does the real delete
-- via the Admin API, since only the service role can remove auth.users)
-- ============================================================

create or replace function public.request_account_deletion()
returns void
language sql
security definer
set search_path = public
as $$
  update profiles set deletion_requested_at = now() where id = auth.uid();
$$;

grant execute on function public.request_account_deletion() to authenticated;

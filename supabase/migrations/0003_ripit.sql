-- "Rip It" — collectible CEO/hedge-fund-manager pack-opening mechanic.
-- Packs are earned (daily free + streak milestones) or bought as consumable
-- IAPs. Real money is involved in a randomized reward, so per Apple
-- guideline 3.1.1 the drop-rate odds below are surfaced in the buy-packs UI
-- (see app/rip/buy-packs.tsx) — do not change these without updating that
-- screen's disclosed percentages.
--
-- Odds: common 60% · rare 25% · epic 12% · legendary 3%

create type card_rarity as enum ('common', 'rare', 'epic', 'legendary');
create type pack_reason as enum ('daily_free', 'streak_milestone', 'iap_purchase', 'pack_opened');

alter table people add column rarity card_rarity not null default 'common';
-- Demo people get their rarity set in supabase/seed.sql at insert time —
-- this migration only adds the column; it doesn't backfill rows, since
-- migrations run before any seed data exists.

create table pack_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reason pack_reason not null,
  amount integer not null, -- positive = granted, negative = spent
  reference_id text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, reason, reference_id, idempotency_key)
);
create index pack_ledger_user_idx on pack_ledger (user_id, created_at desc);

create table pack_openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  person_id uuid not null references people(id),
  rarity card_rarity not null,
  idempotency_key text not null,
  opened_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index pack_openings_user_idx on pack_openings (user_id, opened_at desc);

create table user_person_collection (
  user_id uuid not null references profiles(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  first_unlocked_at timestamptz not null default now(),
  duplicate_count integer not null default 0,
  primary key (user_id, person_id)
);

alter table pack_ledger enable row level security;
alter table pack_openings enable row level security;
alter table user_person_collection enable row level security;

create policy "pack_ledger_select_own" on pack_ledger for select using (auth.uid() = user_id);
create policy "pack_openings_select_own" on pack_openings for select using (auth.uid() = user_id);
create policy "user_person_collection_select_own" on user_person_collection for select using (auth.uid() = user_id);
-- No insert/update policies for any of these three: all writes go through
-- the SECURITY DEFINER functions below, same rule as xp_ledger/user_answers.

-- ============================================================
-- BALANCE
-- ============================================================

create or replace function public.get_pack_balance(p_user uuid default auth.uid())
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(amount), 0)::integer from pack_ledger where user_id = p_user;
$$;

grant execute on function public.get_pack_balance(uuid) to authenticated;

-- ============================================================
-- DAILY FREE PACK (idempotent per user-local day)
-- ============================================================

create or replace function public.claim_daily_pack()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tz text;
  v_today date;
  v_already boolean;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select timezone into v_tz from profiles where id = v_user;
  v_today := (now() at time zone coalesce(v_tz, 'UTC'))::date;

  select exists (
    select 1 from pack_ledger
    where user_id = v_user and reason = 'daily_free' and reference_id = v_today::text
  ) into v_already;

  if not v_already then
    insert into pack_ledger (user_id, reason, amount, reference_id, idempotency_key)
    values (v_user, 'daily_free', 1, v_today::text, 'daily-' || v_today::text)
    on conflict do nothing;
  end if;

  return jsonb_build_object('claimed', not v_already, 'balance', public.get_pack_balance(v_user));
end;
$$;

grant execute on function public.claim_daily_pack() to authenticated;

-- Streak milestones grant bonus packs. Called from recompute_streak (0002)
-- whenever current_streak lands on one of these values.
create or replace function public.grant_streak_pack_if_milestone(p_user uuid, p_streak integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_streak in (7, 30, 100, 365) then
    insert into pack_ledger (user_id, reason, amount, reference_id, idempotency_key)
    values (p_user, 'streak_milestone', 1, p_streak::text, 'streak-' || p_streak::text)
    on conflict do nothing;
  end if;
end;
$$;

-- ============================================================
-- OPEN A PACK (server rolls the rarity — never trust a client roll)
-- ============================================================

create or replace function public.open_pack(idempotency_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_balance integer;
  v_existing record;
  v_roll numeric;
  v_rarity card_rarity;
  v_person people%rowtype;
  v_is_duplicate boolean;
  v_bonus_xp integer := 0;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if idempotency_key is null then raise exception 'idempotency_key required'; end if;

  -- Idempotent replay: return the same result instead of rolling again or double-spending.
  select po.*, p.name, p.slug, p.bio_short, p.portrait_url
    into v_existing
    from pack_openings po join people p on p.id = po.person_id
    where po.user_id = v_user and po.idempotency_key = open_pack.idempotency_key;

  if v_existing.id is not null then
    return jsonb_build_object(
      'person', jsonb_build_object('id', v_existing.person_id, 'name', v_existing.name, 'slug', v_existing.slug, 'portraitUrl', v_existing.portrait_url),
      'rarity', v_existing.rarity,
      'isDuplicate', true,
      'bonusXp', 0,
      'balance', public.get_pack_balance(v_user),
      'replay', true
    );
  end if;

  v_balance := public.get_pack_balance(v_user);
  if v_balance < 1 then
    raise exception 'No packs available';
  end if;

  -- Odds: common 60% / rare 25% / epic 12% / legendary 3%.
  v_roll := random();
  v_rarity := case
    when v_roll < 0.60 then 'common'
    when v_roll < 0.85 then 'rare'
    when v_roll < 0.97 then 'epic'
    else 'legendary'
  end;

  select * into v_person from people
  where status = 'published' and rarity = v_rarity
  order by random() limit 1;

  -- Fall back down the rarity ladder if that tier has no published cards yet.
  if v_person.id is null then
    select * into v_person from people
    where status = 'published'
    order by (case rarity when v_rarity then 0 else 1 end), random()
    limit 1;
    if v_person.id is not null then v_rarity := v_person.rarity; end if;
  end if;

  if v_person.id is null then
    raise exception 'No cards available to open';
  end if;

  insert into pack_ledger (user_id, reason, amount, reference_id, idempotency_key)
  values (v_user, 'pack_opened', -1, v_person.id::text, idempotency_key);

  insert into pack_openings (user_id, person_id, rarity, idempotency_key)
  values (v_user, v_person.id, v_rarity, idempotency_key);

  select exists (
    select 1 from user_person_collection where user_id = v_user and person_id = v_person.id
  ) into v_is_duplicate;

  insert into user_person_collection (user_id, person_id, duplicate_count)
  values (v_user, v_person.id, 0)
  on conflict (user_id, person_id) do update
    set duplicate_count = user_person_collection.duplicate_count + 1;

  if v_is_duplicate then
    v_bonus_xp := case v_rarity when 'legendary' then 25 when 'epic' then 12 when 'rare' then 6 else 2 end;
    insert into xp_ledger (user_id, reason, amount, reference_id, idempotency_key)
    values (v_user, 'card_complete', v_bonus_xp, v_person.id, 'dup-' || idempotency_key)
    on conflict do nothing;
    update profiles set total_xp = total_xp + v_bonus_xp where id = v_user;
  end if;

  return jsonb_build_object(
    'person', jsonb_build_object('id', v_person.id, 'name', v_person.name, 'slug', v_person.slug, 'portraitUrl', v_person.portrait_url),
    'rarity', v_rarity,
    'isDuplicate', v_is_duplicate,
    'bonusXp', v_bonus_xp,
    'balance', public.get_pack_balance(v_user),
    'replay', false
  );
end;
$$;

grant execute on function public.open_pack(text) to authenticated;

-- Re-creates recompute_streak (originally defined in 0002_functions.sql) to
-- also grant a milestone pack. Migrations stay append-only; this is a
-- full replace of that function's body, not a diff against it.
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
  v_new_streak integer;
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
    select current_streak + 1 into v_new_streak from profiles where id = p_user;
    update profiles
      set current_streak = v_new_streak,
          longest_streak = greatest(longest_streak, v_new_streak),
          last_streak_date = v_today
      where id = p_user;
  else
    v_new_streak := 1;
    update profiles
      set current_streak = v_new_streak,
          longest_streak = greatest(longest_streak, v_new_streak),
          last_streak_date = v_today
      where id = p_user;
  end if;

  perform public.grant_streak_pack_if_milestone(p_user, v_new_streak);
end;
$$;

comment on table pack_ledger is 'Authoritative pack balance ledger (earned + purchased + spent). Written only via claim_daily_pack()/open_pack()/the RevenueCat webhook.';
comment on function public.open_pack is 'Server rolls the rarity server-side per the disclosed odds — the client never generates its own random result.';

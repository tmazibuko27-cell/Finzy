-- Finzy MVP initial schema
-- Core entities, content, quiz engine, gamification, and RLS policies.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

create type experience_level as enum ('beginner', 'some_knowledge', 'professional');
create type user_goal as enum ('casual', 'markets', 'career', 'investing');
create type card_type as enum ('fact', 'story', 'person', 'company', 'concept', 'history', 'quiz', 'comparison');
create type content_status as enum ('draft', 'review', 'published', 'archived');
create type question_type as enum ('multiple_choice', 'true_false', 'numeric', 'scenario');
create type entity_type as enum ('person', 'company', 'topic', 'event');
create type follow_target_type as enum ('person', 'company', 'topic');
create type xp_reason as enum (
  'card_complete', 'quiz_correct_easy', 'quiz_correct_medium', 'quiz_correct_hard',
  'daily_quiz_complete', 'first_session_of_day'
);
create type report_status as enum ('open', 'reviewed', 'resolved', 'dismissed');

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  experience_level experience_level,
  goal user_goal,
  timezone text not null default 'UTC',
  onboarding_complete boolean not null default false,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_xp integer not null default 0,
  level integer not null default 1,
  last_streak_date date,
  streak_freeze_available boolean not null default false,
  is_pro boolean not null default false,
  pro_active_until timestamptz,
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_username_idx on profiles (lower(username));

-- ============================================================
-- TAXONOMY / ENTITIES
-- ============================================================

create table topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  bio_short text,
  portrait_url text,
  nationality text,
  roles text[] not null default '{}',
  timeline jsonb not null default '[]',
  sources_reviewed_at timestamptz,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  ticker text,
  logo_url text,
  industry text,
  headquarters_country text,
  founding_year integer,
  description text,
  how_it_makes_money text,
  timeline jsonb not null default '[]',
  sources_reviewed_at timestamptz,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  starts_on date,
  ends_on date,
  causes text,
  consequences text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONTENT: CARDS
-- ============================================================

create table cards (
  id uuid primary key default gen_random_uuid(),
  internal_name text,
  type card_type not null,
  eyebrow text,
  hook text not null,
  body text not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  estimated_seconds integer not null default 20,
  image_url text,
  image_rights_note text,
  story_group_id uuid,
  story_sequence smallint,
  story_total smallint,
  evergreen boolean not null default true,
  expires_at timestamptz,
  review_after timestamptz,
  fact_check_status text,
  reviewer_notes text,
  author_id uuid references profiles(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  status content_status not null default 'draft',
  quality_score numeric not null default 0.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cards_status_published_idx on cards (status, published_at);

create table card_topics (
  card_id uuid not null references cards(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  primary key (card_id, topic_id)
);
create index card_topics_topic_idx on card_topics (topic_id);

create table card_entities (
  card_id uuid not null references cards(id) on delete cascade,
  entity_type entity_type not null,
  entity_id uuid not null,
  primary key (card_id, entity_type, entity_id)
);
create index card_entities_entity_idx on card_entities (entity_type, entity_id);

create table sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  publisher text,
  accessed_at date,
  created_at timestamptz not null default now()
);

create table card_sources (
  card_id uuid not null references cards(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  primary key (card_id, source_id)
);

-- ============================================================
-- QUIZ ENGINE
-- ============================================================

create table questions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete set null,
  prompt text not null,
  type question_type not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  explanation text not null,
  numeric_answer numeric,
  numeric_tolerance numeric,
  numeric_unit text,
  estimated_seconds integer not null default 15,
  xp_reward integer not null default 5,
  version integer not null default 1,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table question_topics (
  question_id uuid not null references questions(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  primary key (question_id, topic_id)
);
create index question_topics_topic_idx on question_topics (topic_id);

create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order smallint not null default 0
);
create index question_options_question_idx on question_options (question_id);

create table question_sources (
  question_id uuid not null references questions(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  primary key (question_id, source_id)
);

-- ============================================================
-- USER ACTIVITY
-- ============================================================

create table user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  question_version integer not null,
  selected_option_id uuid references question_options(id),
  numeric_response numeric,
  correct boolean not null,
  idempotency_key text not null,
  answered_at timestamptz not null default now(),
  unique (user_id, question_id, question_version, idempotency_key)
);
create index user_answers_user_idx on user_answers (user_id, answered_at desc);

create table user_card_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now()
);
create index user_card_events_user_idx on user_card_events (user_id, created_at desc);
create index user_card_events_card_idx on user_card_events (card_id);

create table bookmarks (
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table follows (
  user_id uuid not null references profiles(id) on delete cascade,
  target_type follow_target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);
create index follows_user_idx on follows (user_id, target_type);

create table topic_mastery (
  user_id uuid not null references profiles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  score numeric not null default 50 check (score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reason xp_reason not null,
  amount integer not null,
  reference_id uuid,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, reason, reference_id, idempotency_key)
);
create index xp_ledger_user_idx on xp_ledger (user_id, created_at desc);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text
);

create table user_achievements (
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  reason text not null,
  detail text,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);
create index reports_status_idx on reports (status);

-- ============================================================
-- SEARCH
-- ============================================================

create index people_name_trgm_idx on people using gin (name gin_trgm_ops);
create index companies_name_trgm_idx on companies using gin (name gin_trgm_ops);
create index companies_ticker_idx on companies (ticker);
create index cards_hook_trgm_idx on cards using gin (hook gin_trgm_ops);
create index topics_name_trgm_idx on topics using gin (name gin_trgm_ops);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table topics enable row level security;
alter table people enable row level security;
alter table companies enable row level security;
alter table events enable row level security;
alter table cards enable row level security;
alter table card_topics enable row level security;
alter table card_entities enable row level security;
alter table sources enable row level security;
alter table card_sources enable row level security;
alter table questions enable row level security;
alter table question_topics enable row level security;
alter table question_options enable row level security;
alter table question_sources enable row level security;
alter table user_answers enable row level security;
alter table user_card_events enable row level security;
alter table bookmarks enable row level security;
alter table follows enable row level security;
alter table topic_mastery enable row level security;
alter table xp_ledger enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table reports enable row level security;

-- Profiles: users manage only their own row.
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Public taxonomy/entities: readable by any authenticated user; drafts hidden via status filter.
create policy "topics_read_all" on topics for select using (true);
create policy "people_read_published" on people for select using (status = 'published');
create policy "companies_read_published" on companies for select using (status = 'published');
create policy "events_read_published" on events for select using (status = 'published');

create policy "cards_read_published" on cards for select using (status = 'published');
create policy "card_topics_read" on card_topics for select using (
  exists (select 1 from cards c where c.id = card_topics.card_id and c.status = 'published')
);
create policy "card_entities_read" on card_entities for select using (
  exists (select 1 from cards c where c.id = card_entities.card_id and c.status = 'published')
);
create policy "sources_read_all" on sources for select using (true);
create policy "card_sources_read" on card_sources for select using (
  exists (select 1 from cards c where c.id = card_sources.card_id and c.status = 'published')
);

create policy "questions_read_published" on questions for select using (status = 'published');
create policy "question_topics_read" on question_topics for select using (
  exists (select 1 from questions q where q.id = question_topics.question_id and q.status = 'published')
);
create policy "question_options_read" on question_options for select using (
  exists (select 1 from questions q where q.id = question_options.question_id and q.status = 'published')
);
create policy "question_sources_read" on question_sources for select using (
  exists (select 1 from questions q where q.id = question_sources.question_id and q.status = 'published')
);

-- User-scoped activity: strictly owner-only, no client inserts for XP/mastery.
create policy "user_answers_select_own" on user_answers for select using (auth.uid() = user_id);
create policy "user_card_events_select_own" on user_card_events for select using (auth.uid() = user_id);
create policy "user_card_events_insert_own" on user_card_events for insert with check (auth.uid() = user_id);

create policy "bookmarks_all_own" on bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "follows_all_own" on follows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "topic_mastery_select_own" on topic_mastery for select using (auth.uid() = user_id);
create policy "xp_ledger_select_own" on xp_ledger for select using (auth.uid() = user_id);

create policy "achievements_read_all" on achievements for select using (true);
create policy "user_achievements_select_own" on user_achievements for select using (auth.uid() = user_id);

create policy "reports_insert_own" on reports for insert with check (auth.uid() = user_id);
create policy "reports_select_own" on reports for select using (auth.uid() = user_id);

-- Note: user_answers inserts, xp_ledger inserts, topic_mastery writes, and streak/level updates
-- are performed exclusively by SECURITY DEFINER RPC functions (see 0002_functions.sql),
-- never by direct client insert. This keeps XP/streak/mastery server-authoritative per spec.

comment on table cards is 'Feed content. Only status=published rows are visible to clients.';
comment on table xp_ledger is 'Authoritative XP source of truth; written only via submit_quiz_answer()/award functions.';

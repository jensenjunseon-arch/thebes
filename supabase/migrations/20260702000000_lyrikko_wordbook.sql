-- Lyrikko · word book (단어장) · draft schema · 2026-07-02
--
-- Lyrikko is a distinct product (chart-lyric vocabulary learning for K-pop
-- fans, 14+ self-signup) sharing this Supabase project with Thebes AI, but
-- NOT its parent/student user model — Thebes' `subscriptions`/`billing_*`
-- tables key straight on auth.users(id), and Lyrikko follows the same
-- pattern rather than reusing the (dead) legacy `users` mirror table.
--
-- Two tables:
--   lyrikko_profiles — one row per Lyrikko signup. Carries the 14+ age gate
--     as a DB-level CHECK constraint (defense in depth — even a buggy signup
--     flow cannot insert an under-14 profile) plus consent flags. This is a
--     STRUCTURAL draft only: the actual signup flow, consent copy, and
--     under-14 handling are NOT yet designed — see the app-layer TODO before
--     wiring any UI to this table.
--   saved_words — the personal word book (단어장). Each row is a point-in-time
--     SNAPSHOT of a word explained by /lyrics (song/term/gloss/meaning at
--     save time), not a live re-fetch, so a learner's book stays stable even
--     if the AI explanation changes later. `line` carries the sung fragment
--     the word came from — same ≤9-word cap as the /lyrics UI (never a full
--     lyric line — see lib/lyrics/ai.ts capLine). Spaced repetition is a
--     simple 5-box Leitner scheme for v1 (box/next_review_at/review_count).
--
-- Idempotent: safe to run more than once.

create table if not exists lyrikko_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references auth.users(id) on delete cascade,
  nickname           text,
  birth_date         date not null,
  age_verified       boolean not null default false,
  marketing_opt_in   boolean not null default false,
  night_push_opt_in  boolean not null default false,
  consent_at         timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  constraint lyrikko_profiles_min_age_check
    check (birth_date <= (current_date - interval '14 years'))
);
comment on constraint lyrikko_profiles_min_age_check on lyrikko_profiles is
  '개인정보보호법 제22조의2 — Lyrikko never stores a profile for a signup under 만 14세; no guardian-consent flow exists because under-14 signup is refused outright, not routed around.';

create table if not exists saved_words (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  direction         text not null check (direction in ('en', 'ko')),
  song              text not null,
  artist            text not null default '',
  term              text not null,
  line              text not null default '',
  gloss             text not null default '',
  meaning           text not null default '',
  box               smallint not null default 1 check (box between 1 and 5),
  review_count      integer not null default 0,
  next_review_at    timestamptz not null default now(),
  last_reviewed_at  timestamptz,
  created_at        timestamptz not null default now(),
  unique (user_id, direction, song, artist, term)
);

create index if not exists saved_words_due_idx
  on saved_words (user_id, next_review_at);

alter table lyrikko_profiles enable row level security;
alter table saved_words      enable row level security;

drop policy if exists "lyrikko_profiles: own" on lyrikko_profiles;
create policy "lyrikko_profiles: own" on lyrikko_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved_words: own" on saved_words;
create policy "saved_words: own" on saved_words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Thebes AI · tester feedback · 2026-06-03
-- Anonymous (no-login) feedback captured at the end of the free diagnostic, to
-- validate demand. ANYONE may INSERT; nobody may SELECT through the API — read
-- submissions in the Supabase Table Editor (or with the service role).
-- Idempotent: safe to run more than once.

create table if not exists feedback (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  source           text,      -- e.g. 'demo'
  topic            text,      -- which problem they tried
  level            text,      -- difficulty
  experience       text,      -- meh | ok | great
  willingness      text,      -- no | maybe | yes
  price            integer,   -- the monthly price they were shown (context)
  ai_talent_index  smallint,  -- their composite score (context)
  comment          text,
  user_agent       text
);

create index if not exists feedback_created_idx on feedback (created_at desc);

alter table feedback enable row level security;

drop policy if exists "feedback: anyone insert" on feedback;
create policy "feedback: anyone insert" on feedback
  for insert with check (true);
-- No SELECT policy on purpose — submissions are read from the dashboard only.

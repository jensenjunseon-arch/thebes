-- Thebes AI · re-migration · 2026-06-01
-- Why: the construct model pivoted (assume/paths/verify/logic → decompose/relate/
-- relevance/transfer). The deployed DB still has the OLD construct_id enum.
--
-- (1) Bring construct_id to the new 6 constructs, mapping any legacy rows.
-- (2) Add diagnostic_results — the AI 인재 리포트 snapshot a student saves on signup.
--
-- construct_id is referenced ONLY by scores.construct, so the type can be safely
-- recreated. Idempotent: safe to run more than once.

-- ── (1) construct_id: old set → new set ──────────────────────────────────────
-- Detach the column so the enum type can be dropped & recreated.
alter table scores alter column construct type text;

-- Map any legacy values to their closest new construct (no-op when none exist).
update scores set construct = case construct
  when 'assume' then 'decompose'
  when 'paths'  then 'relate'
  when 'verify' then 'relevance'
  when 'logic'  then 'transfer'
  else construct
end;

drop type if exists construct_id;
create type construct_id as enum
  ('redefine', 'decompose', 'relate', 'relevance', 'transfer', 'english');

alter table scores
  alter column construct type construct_id using construct::construct_id;

-- ── (2) diagnostic_results: saved report snapshot ────────────────────────────
-- Keyed directly on auth.users so the browser client can insert with auth.uid().
-- Shape mirrors lib/resultStore.ts (DiagnosticRecord) for a 1:1 save-on-signup.
create table if not exists diagnostic_results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  topic           text,
  level           text,
  ai_talent_index smallint,
  totals          jsonb not null default '{}'::jsonb,   -- { construct: score }
  evidence        jsonb not null default '{}'::jsonb,   -- { construct: { quote, rationale } }
  coaching        jsonb                                  -- problem coaching (for the English recap)
);

create index if not exists diagnostic_results_user_idx
  on diagnostic_results (user_id, created_at desc);

alter table diagnostic_results enable row level security;

drop policy if exists "diag results: own select" on diagnostic_results;
create policy "diag results: own select" on diagnostic_results
  for select using (auth.uid() = user_id);

drop policy if exists "diag results: own insert" on diagnostic_results;
create policy "diag results: own insert" on diagnostic_results
  for insert with check (auth.uid() = user_id);

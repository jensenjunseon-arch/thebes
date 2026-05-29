-- Thebes AI · initial schema · v0.1
-- PRD §6.5 data model, with two additions:
--   · problems.forbidden_answer_tokens  (answer-leak filter)
--   · sessions.active_step              (step gating)

-- ── EXTENSIONS ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── TYPES ────────────────────────────────────────────────────────────────────
create type user_role    as enum ('student', 'parent');
create type link_status  as enum ('active', 'inactive');
create type session_status as enum ('active', 'completed', 'abandoned');
create type speaker_role as enum ('ai', 'student');
create type construct_id as enum (
  'redefine', 'assume', 'paths', 'verify', 'logic', 'english'
);

-- ── TABLES ───────────────────────────────────────────────────────────────────

-- users: mirrors auth.users; created automatically via trigger.
create table users (
  id         uuid primary key default gen_random_uuid(),
  auth_id    uuid unique references auth.users(id) on delete cascade,
  role       user_role not null,
  email      text not null,
  name       text,
  created_at timestamptz not null default now()
);
comment on column users.auth_id is
  'null until the user completes Supabase Auth signup; nullable to allow demo sessions.';

-- links: one parent ↔ one student per row.
create table links (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references users(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  status     link_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (parent_id, student_id)
);

-- diagnostics: one row per diagnostic session.
create table diagnostics (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references users(id) on delete cascade,
  english_level    text not null,  -- CEFR: A1..C2
  baseline_scores  jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

-- problems: the content pool. v0 seed = 1 demo problem.
create table problems (
  id                      uuid primary key default gen_random_uuid(),
  topic                   text not null,
  difficulty              text not null,
  statement_en            text not null,
  statement_ko            text,
  canonical_solution      text,
  forbidden_answer_tokens text[] not null default '{}',
  created_at              timestamptz not null default now()
);

-- sessions: one row per student × problem × sitting.
create table sessions (
  id          uuid primary key default gen_random_uuid(),
  -- null until auth lands; allow anonymous demo sessions.
  student_id  uuid references users(id) on delete set null,
  problem_id  uuid not null references problems(id),
  active_step smallint not null default 1 check (active_step between 1 and 4),
  status      session_status not null default 'active',
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);

-- turns: every message in a session, in order.
create table turns (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  step       smallint not null check (step between 1 and 4),
  speaker    speaker_role not null,
  content    text not null,
  created_at timestamptz not null default now()
);
create index on turns (session_id, created_at);

-- scores: per-turn construct deltas from the scorer LLM.
create table scores (
  id             uuid primary key default gen_random_uuid(),
  turn_id        uuid not null references turns(id) on delete cascade,
  construct      construct_id not null,
  delta          smallint not null,
  evidence_quote text,
  rationale      text,
  confidence     numeric(4, 3),
  created_at     timestamptz not null default now()
);
create index on scores (turn_id);

-- reports: weekly aggregate sent to the parent.
create table reports (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references users(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  payload_json jsonb not null,
  created_at   timestamptz not null default now()
);
create index on reports (student_id, period_start);


-- ── ROW-LEVEL SECURITY ───────────────────────────────────────────────────────
-- All tables default-deny; service_role (server actions) bypasses RLS.
alter table users       enable row level security;
alter table links       enable row level security;
alter table diagnostics enable row level security;
alter table problems    enable row level security;
alter table sessions    enable row level security;
alter table turns       enable row level security;
alter table scores      enable row level security;
alter table reports     enable row level security;

-- Helper: resolve the current auth user to our users.id.
create function current_user_id()
returns uuid language sql stable security definer as $$
  select id from users where auth_id = auth.uid() limit 1;
$$;

-- users: read your own row; insert via the trigger below.
create policy "users: read own" on users
  for select using (auth_id = auth.uid());

-- problems: any authenticated user may read.
create policy "problems: read" on problems
  for select using (auth.role() = 'authenticated');

-- sessions: student reads/updates own; parent reads linked student's.
create policy "sessions: student access" on sessions
  for all using (
    student_id = current_user_id()
    or exists (
      select 1 from links
      where links.student_id = sessions.student_id
        and links.parent_id = current_user_id()
        and links.status = 'active'
    )
  );

-- turns: mirrors session access.
create policy "turns: via session" on turns
  for all using (
    exists (
      select 1 from sessions s
      where s.id = turns.session_id
        and (
          s.student_id = current_user_id()
          or exists (
            select 1 from links l
            where l.student_id = s.student_id
              and l.parent_id = current_user_id()
              and l.status = 'active'
          )
        )
    )
  );

-- scores: mirrors turns access.
create policy "scores: via turn" on scores
  for all using (
    exists (
      select 1 from turns t
      join sessions s on s.id = t.session_id
      where t.id = scores.turn_id
        and (
          s.student_id = current_user_id()
          or exists (
            select 1 from links l
            where l.student_id = s.student_id
              and l.parent_id = current_user_id()
              and l.status = 'active'
          )
        )
    )
  );

-- reports: student reads own; parent reads linked student's.
create policy "reports: student and parent" on reports
  for select using (
    student_id = current_user_id()
    or exists (
      select 1 from links l
      where l.student_id = reports.student_id
        and l.parent_id = current_user_id()
        and l.status = 'active'
    )
  );

-- diagnostics: student reads own.
create policy "diagnostics: read own" on diagnostics
  for select using (student_id = current_user_id());


-- ── TRIGGER: auto-create user row on signup ──────────────────────────────────
create function handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users (auth_id, role, email, name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    new.email,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_auth_user();

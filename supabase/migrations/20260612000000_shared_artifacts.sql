-- Shared artifacts — the viral loop. A game/quiz/script built in the Studio
-- gets a short public URL (/play/<slug>) the student can send to friends and
-- parents. Each shared artifact is a Thebes-branded landing page with a
-- "나도 만들어보기" CTA.
--
-- SECURITY: the table is fully RLS-locked with NO anon policies. Only the
-- service-role API route (/api/studio/share) writes, and only the /play/[slug]
-- server component reads — both via the admin client, with size/kind caps
-- enforced in the route. Shared HTML is ONLY ever rendered inside a
-- sandbox="allow-scripts" iframe (opaque origin — no cookies, no parent DOM).

create table if not exists public.shared_artifacts (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  kind       text not null check (kind in ('game', 'video', 'quiz')),
  title      text,
  topic      text,
  level      text,
  content    text not null check (char_length(content) <= 500000),
  views      integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists shared_artifacts_slug_idx
  on public.shared_artifacts (slug);

alter table public.shared_artifacts enable row level security;
-- No policies on purpose: anon/authenticated get nothing; service role bypasses RLS.

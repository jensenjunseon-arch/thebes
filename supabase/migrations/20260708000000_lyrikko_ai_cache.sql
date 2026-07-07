-- Server-side cache for AI responses (song word lists, word cards).
-- Popular songs/words are re-requested constantly; without this every tap
-- pays a full Claude call (latency + cost). Only the service-role client
-- reads/writes this table — RLS on with no policies keeps users out.

create table if not exists public.lyrikko_ai_cache (
  key text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.lyrikko_ai_cache enable row level security;

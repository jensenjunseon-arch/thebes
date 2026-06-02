-- Thebes AI · billing · 2026-06-03
-- Toss Payments monthly subscription (정기결제/빌링키).
--
-- subscriptions: one live row per user. Holds the Toss billingKey we charge each
--   cycle. billing_key + customer_key are SERVER-ONLY secrets — the app never
--   SELECTs them into the browser (status reads pick only safe columns). Only the
--   service-role key (webhook/cron/confirm) writes here.
-- billing_payments: an append-only log of every charge attempt.
--
-- Idempotent: safe to run more than once.

create table if not exists subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users(id) on delete cascade,
  status                text not null default 'incomplete', -- incomplete | active | past_due | canceled
  plan_id               text not null,
  amount                integer not null,                   -- KRW charged per cycle
  currency              text not null default 'KRW',
  customer_key          text,                               -- Toss customerKey (stable per user)
  billing_key           text,                               -- Toss billingKey — SERVER-ONLY secret
  cancel_at_period_end  boolean not null default false,
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists billing_payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  order_id     text not null unique,
  payment_key  text,
  amount       integer not null,
  status       text not null,            -- DONE | CANCELED | ABORTED | FAILED | ...
  raw          jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists billing_payments_user_idx
  on billing_payments (user_id, created_at desc);

-- Drives the recurring-charge cron: active subs whose period has ended.
create index if not exists subscriptions_due_idx
  on subscriptions (current_period_end) where status = 'active';

alter table subscriptions enable row level security;
alter table billing_payments enable row level security;

-- Read-only for the owner (to show their status). Writes go through the service
-- role only — there are deliberately NO insert/update policies for end users.
drop policy if exists "subs: own select" on subscriptions;
create policy "subs: own select" on subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "payments: own select" on billing_payments;
create policy "payments: own select" on billing_payments
  for select using (auth.uid() = user_id);

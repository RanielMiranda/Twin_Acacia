-- Phase 3 tables for ticket issues and payment tracking.
-- Run after bookings_schema.sql

alter table public.bookings
  add column if not exists payment_deadline timestamptz,
  add column if not exists updated_at timestamptz default now();

create table if not exists public.booking_transactions (
  id bigint generated always as identity primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  method text not null,
  amount numeric not null default 0,
  balance_after numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_issues (
  id bigint generated always as identity primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  resort_id bigint references public.resorts(id) on delete cascade,
  guest_name text,
  guest_email text,
  subject text,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists booking_transactions_booking_id_idx on public.booking_transactions(booking_id);
create index if not exists ticket_issues_booking_id_idx on public.ticket_issues(booking_id);

alter table public.booking_transactions enable row level security;
alter table public.ticket_issues enable row level security;

drop policy if exists booking_transactions_all_access on public.booking_transactions;
create policy booking_transactions_all_access on public.booking_transactions
for all
using (true)
with check (true);

drop policy if exists ticket_issues_all_access on public.ticket_issues;
create policy ticket_issues_all_access on public.ticket_issues
for all
using (true)
with check (true);

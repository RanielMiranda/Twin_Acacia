-- Phase 10: Auth hardening
-- Run after phase5_accounts.sql / booking_system_related_schema.sql

alter table public.accounts
  alter column password type text;

alter table public.accounts enable row level security;

drop policy if exists accounts_all_access on public.accounts;
drop policy if exists accounts_service_only on public.accounts;
create policy accounts_service_only on public.accounts
  for all
  using (false)
  with check (false);

create table if not exists public.account_recovery_requests (
  id bigint generated always as identity primary key,
  account_id bigint references public.accounts(id) on delete set null,
  email text,
  message text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists account_recovery_requests_status_idx
  on public.account_recovery_requests(status);

create index if not exists account_recovery_requests_created_at_idx
  on public.account_recovery_requests(created_at desc);

alter table public.account_recovery_requests enable row level security;

drop policy if exists account_recovery_requests_service_only on public.account_recovery_requests;
create policy account_recovery_requests_service_only on public.account_recovery_requests
  for all
  using (false)
  with check (false);

-- ==========================================
-- Phase 10: Auth Hardening + Recovery + Add-ons
-- ==========================================
create table if not exists public.account_recovery_requests (
  id bigint generated always as identity primary key,
  account_id bigint references public.accounts(id) on delete set null,
  email text,
  message text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists account_recovery_requests_status_idx on public.account_recovery_requests(status);
alter table public.account_recovery_requests enable row level security;

drop policy if exists account_recovery_requests_service_only on public.account_recovery_requests;
create policy account_recovery_requests_service_only on public.account_recovery_requests
  for all
  using (false)
  with check (false);

-- Add-on: Resort Payment Reference Image
alter table public.resorts add column if not exists payment_image_url text;
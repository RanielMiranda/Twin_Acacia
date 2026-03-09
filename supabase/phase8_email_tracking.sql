-- ==========================================
-- Phase 8: Lean Email Usage Tracking
-- ==========================================
create table if not exists public.email_delivery_logs (
  id bigint generated always as identity primary key,
  template_key text not null,
  recipient_email text,
  recipient_name text,
  booking_id text references public.bookings(id) on delete set null,
  resort_id bigint references public.resorts(id) on delete set null,
  account_id bigint references public.accounts(id) on delete set null,
  provider text,
  provider_message_id text,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_delivery_logs_created_at_idx on public.email_delivery_logs(created_at desc);
create index if not exists email_delivery_logs_status_idx on public.email_delivery_logs(status);

alter table public.email_delivery_logs enable row level security;

drop policy if exists email_delivery_logs_all_access on public.email_delivery_logs;
create policy email_delivery_logs_all_access on public.email_delivery_logs
for all
using (true)
with check (true);
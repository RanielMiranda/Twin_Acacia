-- ==========================================
-- Phase 6: Archive Tables
-- ==========================================
create table if not exists public.ticket_issues_archive (
  id bigint generated always as identity primary key,
  source_issue_id bigint unique,
  booking_id text not null,
  resort_id bigint references public.resorts(id) on delete cascade,
  guest_name text,
  guest_email text,
  subject text,
  message text not null,
  status text not null default 'resolved',
  created_at timestamptz not null default now(),
  resolved_at timestamptz not null default now(),
  archived_at timestamptz not null default now()
);

create table if not exists public.owner_admin_messages_archive (
  id bigint generated always as identity primary key,
  source_message_id bigint unique,
  resort_id bigint references public.resorts(id) on delete cascade,
  sender_name text,
  sender_image text,
  subject text,
  message text not null,
  status text not null default 'resolved',
  created_at timestamptz not null default now(),
  resolved_at timestamptz not null default now(),
  archived_at timestamptz not null default now()
);

create index if not exists ticket_issues_archive_resort_idx on public.ticket_issues_archive(resort_id);
create index if not exists ticket_issues_archive_booking_idx on public.ticket_issues_archive(booking_id);
create index if not exists ticket_issues_archive_resolved_idx on public.ticket_issues_archive(resolved_at desc);
create index if not exists owner_admin_messages_archive_resort_idx on public.owner_admin_messages_archive(resort_id);
create index if not exists owner_admin_messages_archive_resolved_idx on public.owner_admin_messages_archive(resolved_at desc);

alter table public.ticket_issues_archive enable row level security;
alter table public.owner_admin_messages_archive enable row level security;

drop policy if exists ticket_issues_archive_all_access on public.ticket_issues_archive;
create policy ticket_issues_archive_all_access on public.ticket_issues_archive
for all
using (true)
with check (true);

drop policy if exists owner_admin_messages_archive_all_access on public.owner_admin_messages_archive;
create policy owner_admin_messages_archive_all_access on public.owner_admin_messages_archive
for all
using (true)
with check (true);
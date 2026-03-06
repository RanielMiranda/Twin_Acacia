-- Phase 4 extension: owner <-> admin support messaging
-- Run after bookings_schema.sql

create table if not exists public.owner_admin_messages (
  id bigint generated always as identity primary key,
  resort_id bigint references public.resorts(id) on delete cascade,
  sender_role text not null check (sender_role in ('owner', 'admin')),
  sender_name text,
  sender_image text,
  subject text,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.owner_admin_messages
  add column if not exists sender_image text;

create index if not exists owner_admin_messages_resort_idx on public.owner_admin_messages(resort_id);
create index if not exists owner_admin_messages_status_idx on public.owner_admin_messages(status);
create index if not exists owner_admin_messages_created_idx on public.owner_admin_messages(created_at desc);

alter table public.owner_admin_messages enable row level security;

drop policy if exists owner_admin_messages_all_access on public.owner_admin_messages;
create policy owner_admin_messages_all_access on public.owner_admin_messages
for all
using (true)
with check (true);

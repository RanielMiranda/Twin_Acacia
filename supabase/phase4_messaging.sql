-- Phase 4: client-owner/admin booking messaging thread
-- Run after phase3_ticket_payments.sql

create table if not exists public.ticket_messages (
  id bigint generated always as identity primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  resort_id bigint references public.resorts(id) on delete cascade,
  sender_role text not null check (sender_role in ('client', 'owner', 'admin')),
  sender_name text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_booking_id_idx on public.ticket_messages(booking_id);
create index if not exists ticket_messages_created_idx on public.ticket_messages(created_at desc);

alter table public.ticket_messages enable row level security;

drop policy if exists ticket_messages_all_access on public.ticket_messages;
create policy ticket_messages_all_access on public.ticket_messages
for all
using (true)
with check (true);

-- ==========================================
-- Phase 2-3: Payment Tracking, Guest Breakdown, Ticket Issues
-- ==========================================
alter table public.bookings
  add column if not exists payment_deadline timestamptz,
  add column if not exists adult_count integer not null default 0,
  add column if not exists children_count integer not null default 0,
  add column if not exists pax integer not null default 0,
  add column if not exists sleeping_guests integer not null default 0,
  add column if not exists room_count integer not null default 1;

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
create index if not exists bookings_resort_status_idx on public.bookings(resort_id, status);
create index if not exists bookings_guest_breakdown_idx on public.bookings(pax, adult_count, children_count);

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

update public.bookings
set
  adult_count = coalesce((booking_form->>'adultCount')::int, adult_count),
  children_count = coalesce((booking_form->>'childrenCount')::int, children_count),
  pax = coalesce(
    (booking_form->>'guestCount')::int,
    (booking_form->>'pax')::int,
    coalesce((booking_form->>'adultCount')::int, 0) + coalesce((booking_form->>'childrenCount')::int, 0),
    pax
  ),
  sleeping_guests = coalesce((booking_form->>'sleepingGuests')::int, sleeping_guests),
  room_count = coalesce((booking_form->>'roomCount')::int, room_count)
where booking_form <> '{}'::jsonb;
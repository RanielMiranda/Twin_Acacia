-- Booking System Related Schema (All-in-One)
-- Run this after public.resorts exists.
-- This consolidates:
-- bookings_schema.sql
-- phase3_ticket_payments.sql
-- phase4_messaging.sql
-- phase4_owner_admin_messages.sql
-- phase5_accounts.sql
-- phase6_guest_breakdown.sql
-- phase7_archiving.sql

-- ==========================================
-- 1) Core Bookings
-- ==========================================
create table if not exists public.bookings (
  id text primary key,
  resort_id bigint not null references public.resorts(id) on delete cascade,
  room_ids jsonb not null default '[]'::jsonb,
  start_date date,
  end_date date,
  check_in_time text,
  check_out_time text,
  color_class text,
  status text default 'Inquiry',
  booking_form jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_resort_id_idx on public.bookings(resort_id);
create index if not exists bookings_status_idx on public.bookings(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

drop policy if exists bookings_all_access on public.bookings;
create policy bookings_all_access on public.bookings
for all
using (true)
with check (true);

-- ==========================================
-- 2) Payment + Issues
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

-- ==========================================
-- 3) Booking Messaging
-- ==========================================
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

-- ==========================================
-- 4) Owner <-> Admin Messaging
-- ==========================================
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

-- ==========================================
-- 5) Accounts
-- ==========================================
create table if not exists public.accounts (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null unique,
  phone text,
  profile_image text,
  password text not null,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  resort_id bigint references public.resorts(id) on delete set null,
  setup_complete boolean not null default false,
  setup_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounts_role_idx on public.accounts(role);
create index if not exists accounts_status_idx on public.accounts(status);
create index if not exists accounts_resort_idx on public.accounts(resort_id);
create index if not exists accounts_setup_token_idx on public.accounts(setup_token);

alter table public.accounts enable row level security;

drop policy if exists accounts_all_access on public.accounts;
drop policy if exists accounts_service_only on public.accounts;
create policy accounts_service_only on public.accounts
  for all
  using (false)
  with check (false);

-- Optional seed admin:
-- insert into public.accounts (
--   full_name, email, phone, password, role, status, resort_id, setup_complete, setup_token
-- ) values (
--   'Example Admin', 'admin@email.com', '', '12345', 'admin', 'active', null, true, null
-- )
-- on conflict (email)
-- do update set
--   full_name = excluded.full_name,
--   phone = excluded.phone,
--   password = excluded.password,
--   role = excluded.role,
--   status = excluded.status,
--   setup_complete = excluded.setup_complete,
--   setup_token = excluded.setup_token,
--   updated_at = now();

-- ==========================================
-- 6) Backfill + analytics indexes (Phase 6)
-- ==========================================
update public.bookings
set
  adult_count = coalesce(nullif((booking_form->>'adultCount')::int, null), adult_count),
  children_count = coalesce(nullif((booking_form->>'childrenCount')::int, null), children_count),
  pax = coalesce(
    nullif((booking_form->>'guestCount')::int, null),
    nullif((booking_form->>'pax')::int, null),
    coalesce(nullif((booking_form->>'adultCount')::int, null), 0) + coalesce(nullif((booking_form->>'childrenCount')::int, null), 0),
    pax
  ),
  sleeping_guests = coalesce(nullif((booking_form->>'sleepingGuests')::int, null), sleeping_guests),
  room_count = coalesce(nullif((booking_form->>'roomCount')::int, null), room_count);

create index if not exists bookings_resort_status_idx on public.bookings(resort_id, status);
create index if not exists bookings_guest_breakdown_idx on public.bookings(pax, adult_count, children_count);

-- ==========================================
-- 7) Archiving Tables (Phase 7)
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

alter table public.owner_admin_messages_archive
  add column if not exists sender_image text;

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

-- Twin Acacia canonical schema
-- Run this file for a clean setup or to align a local/dev project.
-- Sections below preserve the original phased rollout as documentation.

create extension if not exists pgcrypto;

-- ==========================================
-- Phase 1: Core Bookings
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

-- ==========================================
-- Phase 4: Ticket Messaging + Owner/Admin Messaging
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

create index if not exists ticket_messages_booking_id_idx on public.ticket_messages(booking_id);
create index if not exists ticket_messages_created_idx on public.ticket_messages(created_at desc);
create index if not exists owner_admin_messages_resort_idx on public.owner_admin_messages(resort_id);
create index if not exists owner_admin_messages_status_idx on public.owner_admin_messages(status);
create index if not exists owner_admin_messages_created_idx on public.owner_admin_messages(created_at desc);

alter table public.ticket_messages enable row level security;
alter table public.owner_admin_messages enable row level security;

drop policy if exists ticket_messages_all_access on public.ticket_messages;
create policy ticket_messages_all_access on public.ticket_messages
for all
using (true)
with check (true);

drop policy if exists owner_admin_messages_all_access on public.owner_admin_messages;
create policy owner_admin_messages_all_access on public.owner_admin_messages
for all
using (true)
with check (true);

-- ==========================================
-- Phase 5: Accounts
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

-- ==========================================
-- Phase 7: Archive Tables
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

-- ==========================================
-- Phase 8: Security Hardening
-- ==========================================
create or replace function public.booking_status_transition_allowed(from_status text, to_status text)
returns boolean
language plpgsql
as $$
declare
  f text := lower(coalesce(from_status, 'inquiry'));
  t text := lower(coalesce(to_status, 'inquiry'));
begin
  if f = t then
    return true;
  end if;

  if f = 'inquiry' then
    return t in ('approved inquiry', 'declined', 'cancelled', 'pending payment');
  elsif f = 'approved inquiry' then
    return t in ('pending payment', 'declined', 'cancelled', 'inquiry');
  elsif f = 'pending payment' then
    return t in ('confirmed', 'approved inquiry', 'declined', 'cancelled');
  elsif f = 'confirmed' then
    return t in ('ongoing', 'pending checkout', 'cancelled', 'pending payment');
  elsif f = 'ongoing' then
    return t in ('pending checkout', 'checked out', 'confirmed');
  elsif f = 'pending checkout' then
    return t in ('checked out', 'ongoing');
  elsif f = 'checked out' then
    return false;
  elsif f = 'declined' then
    return t in ('inquiry');
  elsif f = 'cancelled' then
    return false;
  end if;

  return false;
end;
$$;

create or replace function public.enforce_booking_status_transition()
returns trigger
language plpgsql
as $$
declare
  old_status text := coalesce(old.status, old.booking_form->>'status', 'Inquiry');
  new_status text := coalesce(new.status, new.booking_form->>'status', old_status);
begin
  if not public.booking_status_transition_allowed(old_status, new_status) then
    raise exception 'Invalid booking status transition: % -> %', old_status, new_status;
  end if;

  if new.booking_form is null then
    new.booking_form := '{}'::jsonb;
  end if;
  if coalesce(new.booking_form->>'status', '') <> new_status then
    new.booking_form := jsonb_set(new.booking_form, '{status}', to_jsonb(new_status), true);
  end if;
  new.status := new_status;

  return new;
end;
$$;

drop trigger if exists bookings_enforce_status_transition on public.bookings;
create trigger bookings_enforce_status_transition
before update on public.bookings
for each row
execute function public.enforce_booking_status_transition();

create table if not exists public.booking_status_audit (
  id bigint generated always as identity primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  changed_at timestamptz not null default now(),
  actor_role text not null default 'system',
  actor_name text,
  old_status text,
  new_status text
);

create index if not exists booking_status_audit_booking_id_idx on public.booking_status_audit(booking_id);
create index if not exists booking_status_audit_changed_at_idx on public.booking_status_audit(changed_at desc);

alter table public.booking_status_audit enable row level security;

drop policy if exists booking_status_audit_all_access on public.booking_status_audit;
create policy booking_status_audit_all_access on public.booking_status_audit
for all
using (true)
with check (true);

create or replace function public.log_booking_audit()
returns trigger
language plpgsql
as $$
declare
  old_status text := coalesce(old.status, old.booking_form->>'status');
  new_status text := coalesce(new.status, new.booking_form->>'status');
begin
  if old_status is distinct from new_status then
    insert into public.booking_status_audit (
      booking_id,
      actor_role,
      actor_name,
      old_status,
      new_status
    )
    values (
      new.id,
      coalesce(new.booking_form->>'lastActionRole', old.booking_form->>'lastActionRole', auth.jwt()->>'app_role', auth.jwt()->>'role', 'system'),
      coalesce(new.booking_form->>'lastActionBy', old.booking_form->>'lastActionBy', auth.jwt()->>'name', auth.jwt()->>'email', null),
      old_status,
      new_status
    );
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_log_audit on public.bookings;
create trigger bookings_log_audit
after update on public.bookings
for each row
execute function public.log_booking_audit();

alter table public.ticket_messages
  add column if not exists idempotency_key text;

create unique index if not exists ticket_messages_idempotency_key_uidx
  on public.ticket_messages(idempotency_key)
  where idempotency_key is not null;

create or replace function public.send_ticket_message_safe(
  p_booking_id text,
  p_resort_id bigint,
  p_sender_role text,
  p_sender_name text,
  p_message text,
  p_idempotency_key text default null
)
returns public.ticket_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_row public.ticket_messages;
  inserted_row public.ticket_messages;
begin
  if coalesce(trim(p_message), '') = '' then
    raise exception 'Message cannot be empty';
  end if;

  if p_idempotency_key is not null then
    select *
    into existing_row
    from public.ticket_messages
    where idempotency_key = p_idempotency_key
    limit 1;

    if found then
      return existing_row;
    end if;
  end if;

  insert into public.ticket_messages (
    booking_id,
    resort_id,
    sender_role,
    sender_name,
    message,
    idempotency_key
  )
  values (
    p_booking_id,
    p_resort_id,
    p_sender_role,
    p_sender_name,
    p_message,
    p_idempotency_key
  )
  returning * into inserted_row;

  return inserted_row;
end;
$$;

grant execute on function public.send_ticket_message_safe(text, bigint, text, text, text, text) to anon, authenticated, service_role;

-- ==========================================
-- Phase 9: Lean Email Usage Tracking
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
create index if not exists email_delivery_logs_template_idx on public.email_delivery_logs(template_key);
create index if not exists email_delivery_logs_booking_idx on public.email_delivery_logs(booking_id);
create index if not exists email_delivery_logs_resort_idx on public.email_delivery_logs(resort_id);

alter table public.email_delivery_logs enable row level security;

drop policy if exists email_delivery_logs_all_access on public.email_delivery_logs;
create policy email_delivery_logs_all_access on public.email_delivery_logs
for all
using (true)
with check (true);

-- ==========================================
-- Phase 10: Auth Hardening + Recovery Requests
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
create index if not exists account_recovery_requests_created_at_idx on public.account_recovery_requests(created_at desc);

alter table public.account_recovery_requests enable row level security;

drop policy if exists account_recovery_requests_service_only on public.account_recovery_requests;
create policy account_recovery_requests_service_only on public.account_recovery_requests
  for all
  using (false)
  with check (false);

-- ==========================================
-- Add-on: Resort Payment Reference Image
-- ==========================================
alter table public.resorts
  add column if not exists payment_image_url text,
  add column if not exists bank_payment_image_url text;

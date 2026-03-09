-- ==========================================
-- Phase 1: Core Bookings
-- ==========================================
create extension if not exists pgcrypto;

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
-- Phase 6: optional guest breakdown columns for easier SQL analytics/discount logic.
-- Run after bookings_schema.sql and prior phase scripts.
-- Not required for app runtime (the app also stores these inside booking_form JSON).

alter table public.bookings
  add column if not exists adult_count integer not null default 0,
  add column if not exists children_count integer not null default 0,
  add column if not exists pax integer not null default 0,
  add column if not exists sleeping_guests integer not null default 0,
  add column if not exists room_count integer not null default 1;

-- Backfill from booking_form where possible.
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

-- Migration: Simplify booking_status_audit to match displayed columns only
-- Run this on existing DBs that have the old schema. Fresh installs use schema.sql.

-- 1. Drop trigger so we can alter the table
drop trigger if exists bookings_log_audit on public.bookings;

-- 2. Drop redundant columns (kept: id, booking_id, changed_at, actor_role, actor_name, old_status, new_status)
alter table public.booking_status_audit drop column if exists old_downpayment;
alter table public.booking_status_audit drop column if exists new_downpayment;
alter table public.booking_status_audit drop column if exists old_payment_method;
alter table public.booking_status_audit drop column if exists new_payment_method;
alter table public.booking_status_audit drop column if exists old_payment_verified;
alter table public.booking_status_audit drop column if exists new_payment_verified;
alter table public.booking_status_audit drop column if exists old_snapshot;
alter table public.booking_status_audit drop column if exists new_snapshot;

-- 3. Ensure actor_name exists (older schema may not have had it)
alter table public.booking_status_audit add column if not exists actor_name text;

-- 4. Replace trigger: log only on status change (payment changes tracked in booking_transactions)
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

-- 5. Recreate trigger
create trigger bookings_log_audit
after update on public.bookings
for each row
execute function public.log_booking_audit();

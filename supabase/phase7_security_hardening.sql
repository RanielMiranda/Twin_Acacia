-- ==========================================
-- Phase 7: Security Hardening (Transitions & Audit)
-- ==========================================
create or replace function public.booking_status_transition_allowed(from_status text, to_status text)
returns boolean language plpgsql as $$
declare
  f text := lower(coalesce(from_status, 'inquiry'));
  t text := lower(coalesce(to_status, 'inquiry'));
begin
  if f = t then return true; end if;
  if f = 'inquiry' then return t in ('approved inquiry', 'declined', 'cancelled', 'pending payment');
  elsif f = 'approved inquiry' then return t in ('pending payment', 'declined', 'cancelled', 'inquiry');
  elsif f = 'pending payment' then return t in ('confirmed', 'approved inquiry', 'declined', 'cancelled');
  elsif f = 'confirmed' then return t in ('ongoing', 'pending checkout', 'cancelled', 'pending payment');
  elsif f = 'ongoing' then return t in ('pending checkout', 'checked out', 'confirmed');
  elsif f = 'pending checkout' then return t in ('checked out', 'ongoing');
  elsif f = 'checked out' then return false;
  elsif f = 'declined' then return t in ('inquiry');
  elsif f = 'cancelled' then return false;
  end if;
  return false;
end; $$;

create or replace function public.enforce_booking_status_transition()
returns trigger language plpgsql as $$
declare
  old_status text := coalesce(old.status, old.booking_form->>'status', 'Inquiry');
  new_status text := coalesce(new.status, new.booking_form->>'status', old_status);
begin
  if not public.booking_status_transition_allowed(old_status, new_status) then
    raise exception 'Invalid booking status transition: % -> %', old_status, new_status;
  end if;
  if new.booking_form is null then new.booking_form := '{}'::jsonb; end if;
  if coalesce(new.booking_form->>'status', '') <> new_status then
    new.booking_form := jsonb_set(new.booking_form, '{status}', to_jsonb(new_status), true);
  end if;
  new.status := new_status;
  return new;
end; $$;

drop trigger if exists bookings_enforce_status_transition on public.bookings;
create trigger bookings_enforce_status_transition
before update on public.bookings for each row execute function public.enforce_booking_status_transition();

create table if not exists public.booking_status_audit (
  id bigint generated always as identity primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  changed_at timestamptz not null default now(),
  actor_role text not null default 'system',
  actor_name text,
  old_status text,
  new_status text
);

create or replace function public.log_booking_audit()
returns trigger language plpgsql as $$
declare
  old_status text := coalesce(old.status, old.booking_form->>'status');
  new_status text := coalesce(new.status, new.booking_form->>'status');
begin
  if old_status is distinct from new_status then
    insert into public.booking_status_audit (booking_id, actor_role, actor_name, old_status, new_status)
    values (
      new.id,
      coalesce(new.booking_form->>'lastActionRole', old.booking_form->>'lastActionRole', auth.jwt()->>'app_role', auth.jwt()->>'role', 'system'),
      coalesce(new.booking_form->>'lastActionBy', old.booking_form->>'lastActionBy', auth.jwt()->>'name', auth.jwt()->>'email', null),
      old_status, new_status
    );
  end if;
  return new;
end; $$;

create trigger bookings_log_audit after update on public.bookings for each row execute function public.log_booking_audit();

-- Idempotency and Safe Send Function
alter table public.ticket_messages add column if not exists idempotency_key text;
create unique index if not exists ticket_messages_idempotency_key_uidx on public.ticket_messages(idempotency_key) where idempotency_key is not null;

create or replace function public.send_ticket_message_safe(p_booking_id text, p_resort_id bigint, p_sender_role text, p_sender_name text, p_message text, p_idempotency_key text default null)
returns public.ticket_messages language plpgsql security definer set search_path = public as $$
declare existing_row public.ticket_messages; inserted_row public.ticket_messages;
begin
  if coalesce(trim(p_message), '') = '' then raise exception 'Message cannot be empty'; end if;
  if p_idempotency_key is not null then
    select * into existing_row from public.ticket_messages where idempotency_key = p_idempotency_key limit 1;
    if found then return existing_row; end if;
  end if;
  insert into public.ticket_messages (booking_id, resort_id, sender_role, sender_name, message, idempotency_key)
  values (p_booking_id, p_resort_id, p_sender_role, p_sender_name, p_message, p_idempotency_key)
  returning * into inserted_row;
  return inserted_row;
end; $$;

grant execute on function public.send_ticket_message_safe(text, bigint, text, text, text, text) to anon, authenticated, service_role;
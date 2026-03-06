-- Phase 5 seed: example admin account
-- Run after phase5_accounts.sql

insert into public.accounts (
  full_name,
  email,
  phone,
  password,
  role,
  status,
  resort_id,
  setup_complete,
  setup_token
)
values (
  'Example Admin',
  'admin@email.com',
  '',
  '12345',
  'admin',
  'active',
  null,
  true,
  null
)
on conflict (email)
do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  password = excluded.password,
  role = excluded.role,
  status = excluded.status,
  setup_complete = excluded.setup_complete,
  setup_token = excluded.setup_token,
  updated_at = now();


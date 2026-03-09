-- ==========================================
-- 1. Schema Definition: Accounts Table
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

-- ==========================================
-- 2. Indexing for Performance
-- ==========================================
create index if not exists accounts_role_idx on public.accounts(role);
create index if not exists accounts_status_idx on public.accounts(status);
create index if not exists accounts_resort_idx on public.accounts(resort_id);
create index if not exists accounts_setup_token_idx on public.accounts(setup_token);

-- ==========================================
-- 3. Security: Row Level Security (RLS)
-- ==========================================
alter table public.accounts enable row level security;

drop policy if exists accounts_all_access on public.accounts;
drop policy if exists accounts_service_only on public.accounts;
create policy accounts_service_only on public.accounts
  for all
  using (false)
  with check (false);

-- ==========================================
-- 4. Seed Data: Initial Admin Account
-- ==========================================
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
  '12345', -- Legacy bootstrap value. The app upgrades this to a hash on first successful login.
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

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

drop policy if exists accounts_service_only on public.accounts;
create policy accounts_service_only on public.accounts
  for all
  using (false)
  with check (false);
-- Explicit HiveQuote admin authorization. Authentication alone is not admin access.

create table if not exists public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','operator','support','finance','auditor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Admin authorization is resolved by trusted server code. No browser write policies.
create policy admin_user_read_self
  on public.admin_users
  for select
  to authenticated
  using (auth_user_id = auth.uid());

-- Bind contractor business records to authenticated Supabase users.
-- Staging first; backfill existing real contractors deliberately before enforcing broader portal access.

alter table public.contractors
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete restrict;

create index if not exists contractors_auth_user_id_idx
  on public.contractors (auth_user_id)
  where auth_user_id is not null;

-- Correct the prior identity assumption: contractor row ids are not auth user ids.
drop policy if exists contractor_read_own on public.contractors;
drop policy if exists contractor_update_own on public.contractors;

create policy contractor_read_own
  on public.contractors
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy contractor_update_own
  on public.contractors
  for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- HQ-1 Production Foundation & Core Truth Repair
-- Apply to staging first. Production promotion requires governed approval.

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payload_sha256 text not null,
  status text not null check (status in ('processing','processed','ignored','failed')),
  error_text text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, event_id)
);

create index if not exists webhook_events_received_at_idx
  on public.webhook_events (received_at desc);

create table if not exists public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractors(id) on delete restrict,
  amount_cents bigint not null check (amount_cents <> 0),
  entry_type text not null check (entry_type in (
    'funding','lead_debit','lead_credit','refund','adjustment','chargeback','ach_return'
  )),
  source_provider text,
  source_event_id text,
  source_object_id text,
  lead_id uuid references public.leads(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  created_by text not null default 'system',
  unique nulls not distinct (source_provider, source_event_id, entry_type)
);

create index if not exists wallet_ledger_contractor_created_idx
  on public.wallet_ledger (contractor_id, created_at desc);

create or replace function public.wallet_balance(p_contractor_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount_cents), 0)::bigint
  from public.wallet_ledger
  where contractor_id = p_contractor_id;
$$;

create or replace function public.post_wallet_entry(
  p_contractor_id uuid,
  p_amount_cents bigint,
  p_entry_type text,
  p_source_provider text default null,
  p_source_event_id text default null,
  p_source_object_id text default null,
  p_lead_id uuid default null,
  p_notes text default null,
  p_created_by text default 'system'
)
returns table(entry_id uuid, balance_cents bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_amount_cents = 0 then
    raise exception 'wallet entry amount cannot be zero';
  end if;

  perform 1 from public.contractors where id = p_contractor_id for update;
  if not found then
    raise exception 'contractor not found';
  end if;

  insert into public.wallet_ledger (
    contractor_id, amount_cents, entry_type, source_provider,
    source_event_id, source_object_id, lead_id, notes, created_by
  ) values (
    p_contractor_id, p_amount_cents, p_entry_type, p_source_provider,
    p_source_event_id, p_source_object_id, p_lead_id, p_notes, p_created_by
  )
  returning id into v_id;

  return query select v_id, public.wallet_balance(p_contractor_id);
end;
$$;

-- Ledger rows are append-only through normal application paths.
create or replace function public.prevent_wallet_ledger_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'wallet_ledger is append-only';
end;
$$;

drop trigger if exists wallet_ledger_no_update on public.wallet_ledger;
create trigger wallet_ledger_no_update
before update or delete on public.wallet_ledger
for each row execute function public.prevent_wallet_ledger_mutation();

alter table public.webhook_events enable row level security;
alter table public.wallet_ledger enable row level security;

-- No client-facing policies are intentionally created here. Service-role server code owns writes.

-- HQ-1 one-at-a-time routing / offer / rescue state machine.
-- Staging/synthetic validation only until separately approved for production.
-- This migration intentionally does NOT debit a contractor wallet when an offer is created or accepted.

create table if not exists public.routing_runs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  state text not null check (state in ('routing','offered','assigned','hold','exhausted','cancelled','failed')),
  attempt_no integer not null check (attempt_no > 0),
  idempotency_key text,
  last_error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (lead_id, attempt_no),
  unique (idempotency_key)
);

create table if not exists public.lead_offers (
  id uuid primary key default gen_random_uuid(),
  routing_run_id uuid not null references public.routing_runs(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id) on delete restrict,
  attempt_no integer not null check (attempt_no > 0),
  status text not null check (status in ('offered','accepted','declined','expired','revoked','rescued')),
  ppl_price_snapshot_cents integer,
  offered_at timestamptz not null default now(),
  expires_at timestamptz not null,
  responded_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  contact_due_at timestamptz,
  contacted_at timestamptz,
  rescue_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, attempt_no)
);

create unique index if not exists lead_offers_one_open_per_lead_idx
  on public.lead_offers (lead_id)
  where status = 'offered';

create index if not exists lead_offers_contractor_status_idx
  on public.lead_offers (contractor_id, status, offered_at desc);

create index if not exists lead_offers_expiry_idx
  on public.lead_offers (status, expires_at)
  where status = 'offered';

create table if not exists public.routing_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  offer_id uuid references public.lead_offers(id) on delete set null,
  contractor_id uuid references public.contractors(id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  triggered_by text not null default 'system',
  idempotency_key text,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);

create index if not exists routing_events_lead_created_idx
  on public.routing_events (lead_id, created_at desc);

alter table public.lead_assignments
  add column if not exists source_offer_id uuid references public.lead_offers(id) on delete restrict;

create unique index if not exists lead_assignments_source_offer_idx
  on public.lead_assignments (source_offer_id)
  where source_offer_id is not null;

alter table public.routing_runs enable row level security;
alter table public.lead_offers enable row level security;
alter table public.routing_events enable row level security;

-- No client write policies are created. All state transitions go through server-side service-role RPC calls.
-- Contractors may read only their own offers.
drop policy if exists contractor_read_own_lead_offers on public.lead_offers;
create policy contractor_read_own_lead_offers on public.lead_offers
  for select using (
    exists (
      select 1
      from public.contractors c
      where c.id = lead_offers.contractor_id
        and c.auth_user_id = auth.uid()
    )
  );

create or replace function public.reserve_next_lead_offer(
  p_lead_id uuid,
  p_offer_ttl_minutes integer default 60,
  p_actor text default 'system',
  p_idempotency_key text default null
)
returns table(
  route_status text,
  offer_id uuid,
  contractor_id uuid,
  contractor_business_name text,
  contractor_phone text,
  contractor_email text,
  contractor_ghl_contact_id text,
  billing_model text,
  ppl_price_snapshot_cents integer,
  offer_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads%rowtype;
  v_existing public.lead_offers%rowtype;
  v_contractor record;
  v_attempt integer;
  v_run_id uuid;
  v_offer_id uuid;
  v_expires_at timestamptz;
  v_price integer;
begin
  if p_offer_ttl_minutes < 5 or p_offer_ttl_minutes > 1440 then
    raise exception 'offer ttl must be between 5 and 1440 minutes';
  end if;

  select * into v_lead
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'lead not found';
  end if;

  -- Idempotent replay: return the existing run's current offer when the caller retries the same request.
  if p_idempotency_key is not null then
    select lo.* into v_existing
    from public.routing_runs rr
    join public.lead_offers lo on lo.routing_run_id = rr.id
    where rr.idempotency_key = p_idempotency_key
    limit 1;

    if found then
      return query
      select 'existing_offer'::text, v_existing.id, c.id, c.business_name, c.phone, c.email,
             c.ghl_contact_id, c.billing_model, v_existing.ppl_price_snapshot_cents, v_existing.expires_at
      from public.contractors c where c.id = v_existing.contractor_id;
      return;
    end if;
  end if;

  -- If another request already created a live offer, return it instead of allocating a second contractor.
  select * into v_existing
  from public.lead_offers
  where lead_id = p_lead_id
    and status = 'offered'
  for update;

  if found and v_existing.expires_at > now() then
    return query
    select 'existing_offer'::text, v_existing.id, c.id, c.business_name, c.phone, c.email,
           c.ghl_contact_id, c.billing_model, v_existing.ppl_price_snapshot_cents, v_existing.expires_at
    from public.contractors c where c.id = v_existing.contractor_id;
    return;
  elsif found then
    update public.lead_offers
      set status = 'expired', responded_at = coalesce(responded_at, now()), updated_at = now()
    where id = v_existing.id;

    insert into public.routing_events (lead_id, offer_id, contractor_id, event_type, triggered_by)
    values (p_lead_id, v_existing.id, v_existing.contractor_id, 'offer_expired', p_actor);
  end if;

  -- Do not allocate another contractor while an accepted assignment is still active.
  if exists (
    select 1
    from public.lead_assignments la
    where la.lead_id = p_lead_id
      and (la.outcome is null or la.outcome = 'pending')
  ) then
    raise exception 'lead already has an active assignment';
  end if;

  select coalesce(max(attempt_no), 0) + 1
    into v_attempt
  from public.lead_offers
  where lead_id = p_lead_id;

  insert into public.routing_runs (lead_id, state, attempt_no, idempotency_key)
  values (p_lead_id, 'routing', v_attempt, p_idempotency_key)
  returning id into v_run_id;

  -- Candidate eligibility is deliberately fail-closed: active contractor, active license,
  -- available/limited capacity, exact normalized trade + ZIP, never previously offered this lead,
  -- and sufficient immutable-ledger funds for PPL accounts.
  select
    c.id,
    c.business_name,
    c.phone,
    c.email,
    c.ghl_contact_id,
    c.billing_model,
    t.ppl_price_cents
  into v_contractor
  from public.contractors c
  join public.contractor_service_areas csa on csa.contractor_id = c.id
  join public.trades t on t.id = csa.trade_id
  where csa.trade_id = v_lead.trade_id
    and csa.zip_code = v_lead.zip_code
    and c.status = 'active'
    and c.license_status = 'active'
    and c.capacity_status in ('available','limited')
    and not exists (
      select 1 from public.lead_offers prior
      where prior.lead_id = p_lead_id and prior.contractor_id = c.id
    )
    and (
      c.billing_model <> 'ppl'
      or public.wallet_balance(c.id) >= t.ppl_price_cents
    )
  order by
    csa.is_exclusive_zone desc,
    c.leads_delivered_this_month asc,
    coalesce(c.close_rate_pct, 0) desc,
    c.created_at asc
  limit 1
  for update of c skip locked;

  if not found then
    update public.routing_runs
      set state = 'hold', completed_at = now()
    where id = v_run_id;

    update public.leads
      set status = 'routing_failed', updated_at = now()
    where id = p_lead_id;

    insert into public.routing_events (
      lead_id, event_type, event_data, triggered_by,
      idempotency_key
    ) values (
      p_lead_id, 'routing_no_match', jsonb_build_object('attempt_no', v_attempt), p_actor,
      case when p_idempotency_key is null then null else p_idempotency_key || ':no-match' end
    );

    return query
    select 'no_match'::text, null::uuid, null::uuid, null::text, null::text, null::text,
           null::text, null::text, null::integer, null::timestamptz;
    return;
  end if;

  v_price := v_contractor.ppl_price_cents;
  v_expires_at := now() + make_interval(mins => p_offer_ttl_minutes);

  insert into public.lead_offers (
    routing_run_id, lead_id, contractor_id, attempt_no, status,
    ppl_price_snapshot_cents, offered_at, expires_at
  ) values (
    v_run_id, p_lead_id, v_contractor.id, v_attempt, 'offered',
    v_price, now(), v_expires_at
  ) returning id into v_offer_id;

  update public.routing_runs
    set state = 'offered', completed_at = now()
  where id = v_run_id;

  update public.leads
    set status = 'routing', updated_at = now()
  where id = p_lead_id;

  insert into public.routing_events (
    lead_id, offer_id, contractor_id, event_type, event_data, triggered_by,
    idempotency_key
  ) values (
    p_lead_id, v_offer_id, v_contractor.id, 'offer_created',
    jsonb_build_object('attempt_no', v_attempt, 'expires_at', v_expires_at, 'ppl_price_snapshot_cents', v_price),
    p_actor,
    case when p_idempotency_key is null then null else p_idempotency_key || ':offer' end
  );

  return query
  select 'offered'::text, v_offer_id, v_contractor.id, v_contractor.business_name,
         v_contractor.phone, v_contractor.email, v_contractor.ghl_contact_id,
         v_contractor.billing_model, v_price, v_expires_at;
end;
$$;

create or replace function public.accept_lead_offer(
  p_offer_id uuid,
  p_contractor_id uuid,
  p_contact_sla_minutes integer default 120,
  p_actor text default 'contractor'
)
returns table(
  transition_status text,
  assignment_id uuid,
  lead_id uuid,
  contact_due_at timestamptz,
  ppl_price_snapshot_cents integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.lead_offers%rowtype;
  v_assignment_id uuid;
  v_contact_due timestamptz;
  v_existing uuid;
begin
  if p_contact_sla_minutes < 15 or p_contact_sla_minutes > 1440 then
    raise exception 'contact sla must be between 15 and 1440 minutes';
  end if;

  select * into v_offer
  from public.lead_offers
  where id = p_offer_id
  for update;

  if not found or v_offer.contractor_id <> p_contractor_id then
    raise exception 'offer not found for contractor';
  end if;

  if v_offer.status = 'accepted' then
    select id into v_existing
    from public.lead_assignments
    where source_offer_id = v_offer.id;

    return query
    select 'already_accepted'::text, v_existing, v_offer.lead_id,
           v_offer.contact_due_at, v_offer.ppl_price_snapshot_cents;
    return;
  end if;

  if v_offer.status <> 'offered' then
    return query
    select v_offer.status::text, null::uuid, v_offer.lead_id,
           v_offer.contact_due_at, v_offer.ppl_price_snapshot_cents;
    return;
  end if;

  if v_offer.expires_at <= now() then
    update public.lead_offers
      set status = 'expired', responded_at = now(), updated_at = now()
    where id = v_offer.id;

    insert into public.routing_events (lead_id, offer_id, contractor_id, event_type, triggered_by)
    values (v_offer.lead_id, v_offer.id, v_offer.contractor_id, 'offer_expired_on_accept', p_actor);

    return query
    select 'expired'::text, null::uuid, v_offer.lead_id, null::timestamptz,
           v_offer.ppl_price_snapshot_cents;
    return;
  end if;

  perform 1 from public.leads where id = v_offer.lead_id for update;

  if exists (
    select 1 from public.lead_assignments la
    where la.lead_id = v_offer.lead_id
      and (la.outcome is null or la.outcome = 'pending')
      and la.source_offer_id is distinct from v_offer.id
  ) then
    raise exception 'lead already has an active assignment';
  end if;

  v_contact_due := now() + make_interval(mins => p_contact_sla_minutes);

  update public.lead_offers
    set status = 'accepted', responded_at = now(), accepted_at = now(),
        contact_due_at = v_contact_due, updated_at = now()
  where id = v_offer.id;

  insert into public.lead_assignments (
    lead_id, contractor_id, source_offer_id, contractor_accepted_at,
    outcome, ppl_charged, ppl_amount_cents
  ) values (
    v_offer.lead_id, v_offer.contractor_id, v_offer.id, now(),
    'pending', false, v_offer.ppl_price_snapshot_cents
  )
  returning id into v_assignment_id;

  update public.contractors
    set leads_delivered_this_month = leads_delivered_this_month + 1,
        total_leads_delivered = total_leads_delivered + 1,
        consecutive_non_response_count = 0,
        updated_at = now()
  where id = v_offer.contractor_id;

  update public.leads
    set status = 'assigned', updated_at = now()
  where id = v_offer.lead_id;

  update public.routing_runs
    set state = 'assigned'
  where id = v_offer.routing_run_id;

  insert into public.routing_events (
    lead_id, offer_id, contractor_id, event_type, event_data, triggered_by
  ) values (
    v_offer.lead_id, v_offer.id, v_offer.contractor_id, 'offer_accepted',
    jsonb_build_object('assignment_id', v_assignment_id, 'contact_due_at', v_contact_due), p_actor
  );

  insert into public.lead_delivery_events (lead_assignment_id, event_type, event_data, triggered_by)
  values (
    v_assignment_id, 'contractor_accepted',
    jsonb_build_object('offer_id', v_offer.id, 'contact_due_at', v_contact_due), p_actor
  );

  return query
  select 'accepted'::text, v_assignment_id, v_offer.lead_id, v_contact_due,
         v_offer.ppl_price_snapshot_cents;
end;
$$;

create or replace function public.decline_lead_offer(
  p_offer_id uuid,
  p_contractor_id uuid,
  p_reason text default null,
  p_actor text default 'contractor'
)
returns table(transition_status text, lead_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.lead_offers%rowtype;
begin
  select * into v_offer
  from public.lead_offers
  where id = p_offer_id
  for update;

  if not found or v_offer.contractor_id <> p_contractor_id then
    raise exception 'offer not found for contractor';
  end if;

  if v_offer.status <> 'offered' then
    return query select v_offer.status::text, v_offer.lead_id;
    return;
  end if;

  update public.lead_offers
    set status = 'declined', responded_at = now(), declined_at = now(),
        decline_reason = left(p_reason, 500), updated_at = now()
  where id = v_offer.id;

  update public.leads set status = 'routing', updated_at = now() where id = v_offer.lead_id;

  insert into public.routing_events (
    lead_id, offer_id, contractor_id, event_type, event_data, triggered_by
  ) values (
    v_offer.lead_id, v_offer.id, v_offer.contractor_id, 'offer_declined',
    jsonb_build_object('reason', left(p_reason, 500)), p_actor
  );

  return query select 'declined'::text, v_offer.lead_id;
end;
$$;

create or replace function public.mark_assignment_contacted(
  p_assignment_id uuid,
  p_contractor_id uuid,
  p_actor text default 'contractor'
)
returns table(transition_status text, lead_id uuid, contacted_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment public.lead_assignments%rowtype;
  v_now timestamptz := now();
begin
  select * into v_assignment
  from public.lead_assignments
  where id = p_assignment_id
  for update;

  if not found or v_assignment.contractor_id <> p_contractor_id then
    raise exception 'assignment not found for contractor';
  end if;

  if v_assignment.contractor_contacted_homeowner_at is not null then
    return query select 'already_contacted'::text, v_assignment.lead_id,
      v_assignment.contractor_contacted_homeowner_at;
    return;
  end if;

  if v_assignment.outcome is not null and v_assignment.outcome <> 'pending' then
    return query select 'inactive_assignment'::text, v_assignment.lead_id, null::timestamptz;
    return;
  end if;

  update public.lead_assignments
    set contractor_contacted_homeowner_at = v_now, updated_at = v_now
  where id = v_assignment.id;

  if v_assignment.source_offer_id is not null then
    update public.lead_offers
      set contacted_at = v_now, updated_at = v_now
    where id = v_assignment.source_offer_id;
  end if;

  update public.leads set status = 'contacted', updated_at = v_now where id = v_assignment.lead_id;

  insert into public.lead_delivery_events (lead_assignment_id, event_type, event_data, triggered_by)
  values (v_assignment.id, 'homeowner_contacted', '{}'::jsonb, p_actor);

  insert into public.routing_events (lead_id, offer_id, contractor_id, event_type, triggered_by)
  values (v_assignment.lead_id, v_assignment.source_offer_id, v_assignment.contractor_id,
          'homeowner_contacted', p_actor);

  return query select 'contacted'::text, v_assignment.lead_id, v_now;
end;
$$;

create or replace function public.release_overdue_routing_work(
  p_limit integer default 50,
  p_actor text default 'system'
)
returns table(lead_id uuid, release_reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_count integer := 0;
begin
  if p_limit < 1 or p_limit > 500 then
    raise exception 'limit must be between 1 and 500';
  end if;

  -- Unaccepted offers that timed out can be offered to the next contractor.
  for r in
    select lo.id, lo.lead_id, lo.contractor_id
    from public.lead_offers lo
    where lo.status = 'offered' and lo.expires_at <= now()
    order by lo.expires_at asc
    for update skip locked
  loop
    exit when v_count >= p_limit;

    update public.lead_offers
      set status = 'expired', responded_at = coalesce(responded_at, now()), updated_at = now()
    where id = r.id;

    update public.leads set status = 'routing', updated_at = now() where id = r.lead_id;

    insert into public.routing_events (lead_id, offer_id, contractor_id, event_type, triggered_by)
    values (r.lead_id, r.id, r.contractor_id, 'offer_expired', p_actor);

    v_count := v_count + 1;
    lead_id := r.lead_id;
    release_reason := 'offer_expired';
    return next;
  end loop;

  -- Accepted assignments that miss contact SLA are explicitly released before another offer is allowed.
  for r in
    select lo.id as offer_id, lo.lead_id, lo.contractor_id, la.id as assignment_id
    from public.lead_offers lo
    join public.lead_assignments la on la.source_offer_id = lo.id
    where lo.status = 'accepted'
      and lo.contacted_at is null
      and lo.contact_due_at is not null
      and lo.contact_due_at <= now()
      and (la.outcome is null or la.outcome = 'pending')
    order by lo.contact_due_at asc
    for update of lo, la skip locked
  loop
    exit when v_count >= p_limit;

    update public.lead_offers
      set status = 'rescued', rescue_reason = 'contact_sla_missed', updated_at = now()
    where id = r.offer_id;

    update public.lead_assignments
      set outcome = 'expired', outcome_reported_at = now(), updated_at = now()
    where id = r.assignment_id;

    update public.contractors
      set consecutive_non_response_count = consecutive_non_response_count + 1,
          updated_at = now()
    where id = r.contractor_id;

    update public.leads set status = 'routing', updated_at = now() where id = r.lead_id;

    insert into public.routing_events (
      lead_id, offer_id, contractor_id, event_type, event_data, triggered_by
    ) values (
      r.lead_id, r.offer_id, r.contractor_id, 'assignment_rescued',
      jsonb_build_object('assignment_id', r.assignment_id, 'reason', 'contact_sla_missed'), p_actor
    );

    insert into public.lead_delivery_events (lead_assignment_id, event_type, event_data, triggered_by)
    values (r.assignment_id, 'assignment_rescued', jsonb_build_object('reason', 'contact_sla_missed'), p_actor);

    v_count := v_count + 1;
    lead_id := r.lead_id;
    release_reason := 'contact_sla_missed';
    return next;
  end loop;
end;
$$;

-- SECURITY DEFINER functions are server-only. Authenticated clients must use API routes, not invoke state changes directly.
revoke all on function public.reserve_next_lead_offer(uuid, integer, text, text) from public, anon, authenticated;
revoke all on function public.accept_lead_offer(uuid, uuid, integer, text) from public, anon, authenticated;
revoke all on function public.decline_lead_offer(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.mark_assignment_contacted(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.release_overdue_routing_work(integer, text) from public, anon, authenticated;

grant execute on function public.reserve_next_lead_offer(uuid, integer, text, text) to service_role;
grant execute on function public.accept_lead_offer(uuid, uuid, integer, text) to service_role;
grant execute on function public.decline_lead_offer(uuid, uuid, text, text) to service_role;
grant execute on function public.mark_assignment_contacted(uuid, uuid, text) to service_role;
grant execute on function public.release_overdue_routing_work(integer, text) to service_role;

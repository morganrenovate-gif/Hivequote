-- Corrective HQ-1 routing migration: deterministic no-match retries and unique rescue reroute keys.
-- This supersedes the function bodies created earlier in this branch.

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
  v_run public.routing_runs%rowtype;
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

  -- Any replay of the same idempotency key returns the previously committed outcome,
  -- including a no-match outcome that produced no offer row.
  if p_idempotency_key is not null then
    select * into v_run
    from public.routing_runs
    where idempotency_key = p_idempotency_key
    limit 1;

    if found then
      select * into v_existing
      from public.lead_offers
      where routing_run_id = v_run.id
      limit 1;

      if found then
        return query
        select 'existing_offer'::text, v_existing.id, c.id, c.business_name, c.phone, c.email,
               c.ghl_contact_id, c.billing_model, v_existing.ppl_price_snapshot_cents, v_existing.expires_at
        from public.contractors c where c.id = v_existing.contractor_id;
      else
        return query
        select 'existing_no_match'::text, null::uuid, null::uuid, null::text, null::text, null::text,
               null::text, null::text, null::integer, null::timestamptz;
      end if;
      return;
    end if;
  end if;

  select * into v_existing
  from public.lead_offers
  where lead_id = p_lead_id and status = 'offered'
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

  if exists (
    select 1 from public.lead_assignments la
    where la.lead_id = p_lead_id and (la.outcome is null or la.outcome = 'pending')
  ) then
    raise exception 'lead already has an active assignment';
  end if;

  -- Routing attempts must advance even when a prior run produced no offer.
  select coalesce(max(rr.attempt_no), 0) + 1 into v_attempt
  from public.routing_runs rr
  where rr.lead_id = p_lead_id;

  insert into public.routing_runs (lead_id, state, attempt_no, idempotency_key)
  values (p_lead_id, 'routing', v_attempt, p_idempotency_key)
  returning id into v_run_id;

  select c.id, c.business_name, c.phone, c.email, c.ghl_contact_id,
         c.billing_model, t.ppl_price_cents
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
    and (c.billing_model <> 'ppl' or public.wallet_balance(c.id) >= t.ppl_price_cents)
  order by csa.is_exclusive_zone desc,
           c.leads_delivered_this_month asc,
           coalesce(c.close_rate_pct, 0) desc,
           c.created_at asc
  limit 1
  for update of c skip locked;

  if not found then
    update public.routing_runs set state = 'hold', completed_at = now() where id = v_run_id;
    update public.leads set status = 'routing_failed', updated_at = now() where id = p_lead_id;

    insert into public.routing_events (
      lead_id, event_type, event_data, triggered_by, idempotency_key
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

  update public.routing_runs set state = 'offered', completed_at = now() where id = v_run_id;
  update public.leads set status = 'routing', updated_at = now() where id = p_lead_id;

  insert into public.routing_events (
    lead_id, offer_id, contractor_id, event_type, event_data, triggered_by, idempotency_key
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

revoke all on function public.reserve_next_lead_offer(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.reserve_next_lead_offer(uuid, integer, text, text) to service_role;

-- Return the exact released offer id so each rescue reroute gets a stable unique idempotency key.
drop function if exists public.release_overdue_routing_work(integer, text);

create function public.release_overdue_routing_work(
  p_limit integer default 50,
  p_actor text default 'system'
)
returns table(released_offer_id uuid, released_lead_id uuid, release_reason text)
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
    released_offer_id := r.id;
    released_lead_id := r.lead_id;
    release_reason := 'offer_expired';
    return next;
  end loop;

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
      set consecutive_non_response_count = consecutive_non_response_count + 1, updated_at = now()
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
    released_offer_id := r.offer_id;
    released_lead_id := r.lead_id;
    release_reason := 'contact_sla_missed';
    return next;
  end loop;
end;
$$;

revoke all on function public.release_overdue_routing_work(integer, text) from public, anon, authenticated;
grant execute on function public.release_overdue_routing_work(integer, text) to service_role;

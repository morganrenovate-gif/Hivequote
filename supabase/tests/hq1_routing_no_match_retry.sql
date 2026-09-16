-- HQ-1 no-match recovery invariant.
-- Disposable/local/staging only. All writes roll back.

begin;

do $$
declare
  v_trade uuid := gen_random_uuid();
  v_contractor uuid := gen_random_uuid();
  v_lead uuid := gen_random_uuid();
  v_status text;
  v_offer uuid;
  v_attempts integer[];
begin
  insert into public.trades (id, slug, name, ppl_price_cents, is_active)
  values (v_trade, 'hq1-retry-' || replace(v_trade::text, '-', ''), 'HQ1 Retry Trade', 2500, true);

  insert into public.contractors (
    id, business_name, phone, email, status, license_status, capacity_status,
    billing_model, leads_delivered_this_month, total_leads_delivered
  ) values (
    v_contractor, 'HQ1 Retry Contractor', '+18010000003', 'hq1-retry@example.invalid',
    'active', 'active', 'available', 'ppl', 0, 0
  );

  perform public.post_wallet_entry(
    v_contractor, 10000, 'funding', 'synthetic', 'retry-fund-' || v_contractor::text,
    null, null, 'HQ1 no-match retry test', 'hq1-test'
  );

  insert into public.leads (id, trade_id, first_name, phone, zip_code, timeline, status)
  values (v_lead, v_trade, 'Retry Lead', '+18015550004', '84001', 'Within 30 days', 'qualified');

  select r.route_status into v_status
  from public.reserve_next_lead_offer(v_lead, 60, 'hq1-test', 'hq1:no-match:first') r;
  if v_status <> 'no_match' then
    raise exception 'expected initial no_match, got %', v_status;
  end if;

  select r.route_status into v_status
  from public.reserve_next_lead_offer(v_lead, 60, 'hq1-test', 'hq1:no-match:first') r;
  if v_status <> 'existing_no_match' then
    raise exception 'expected idempotent existing_no_match, got %', v_status;
  end if;

  insert into public.contractor_service_areas (contractor_id, trade_id, zip_code, is_exclusive_zone)
  values (v_contractor, v_trade, '84001', false);

  select r.route_status, r.offer_id into v_status, v_offer
  from public.reserve_next_lead_offer(v_lead, 60, 'hq1-test', 'hq1:no-match:second') r;
  if v_status <> 'offered' or v_offer is null then
    raise exception 'expected recovery offer after capacity appeared, got %', v_status;
  end if;

  select array_agg(rr.attempt_no order by rr.attempt_no)
    into v_attempts
  from public.routing_runs rr
  where rr.lead_id = v_lead;

  if v_attempts is distinct from array[1,2] then
    raise exception 'routing attempts were not monotonic: %', v_attempts;
  end if;

  if (select attempt_no from public.lead_offers where id = v_offer) <> 2 then
    raise exception 'recovery offer did not inherit routing attempt 2';
  end if;
end;
$$;

rollback;

-- HQ-1 synthetic routing invariant test.
-- Run only against a disposable/local/staging database after migrations.
-- Every write is rolled back. Any invariant failure raises an exception.

begin;

do $$
declare
  v_trade uuid := gen_random_uuid();
  v_c1 uuid := gen_random_uuid();
  v_c2 uuid := gen_random_uuid();
  v_lead1 uuid := gen_random_uuid();
  v_lead2 uuid := gen_random_uuid();
  v_lead3 uuid := gen_random_uuid();
  v_offer1 uuid;
  v_offer1_replay uuid;
  v_offer2a uuid;
  v_offer2b uuid;
  v_offer3a uuid;
  v_offer3b uuid;
  v_assignment1 uuid;
  v_assignment3 uuid;
  v_status text;
  v_count integer;
begin
  insert into public.trades (id, slug, name, ppl_price_cents, is_active)
  values (v_trade, 'hq1-synthetic-' || replace(v_trade::text, '-', ''), 'HQ1 Synthetic Trade', 5000, true);

  insert into public.contractors (
    id, business_name, phone, email, status, license_status, capacity_status,
    billing_model, leads_delivered_this_month, total_leads_delivered
  ) values
    (v_c1, 'HQ1 Synthetic A', '+18010000001', 'hq1-a@example.invalid', 'active', 'active', 'available', 'ppl', 0, 0),
    (v_c2, 'HQ1 Synthetic B', '+18010000002', 'hq1-b@example.invalid', 'active', 'active', 'available', 'ppl', 1, 1);

  insert into public.contractor_service_areas (contractor_id, trade_id, zip_code, is_exclusive_zone)
  values
    (v_c1, v_trade, '84000', true),
    (v_c2, v_trade, '84000', false);

  perform public.post_wallet_entry(v_c1, 20000, 'funding', 'synthetic', 'fund-c1-' || v_c1::text, null, null, 'HQ1 test', 'hq1-test');
  perform public.post_wallet_entry(v_c2, 20000, 'funding', 'synthetic', 'fund-c2-' || v_c2::text, null, null, 'HQ1 test', 'hq1-test');

  insert into public.leads (id, trade_id, first_name, phone, zip_code, timeline, status)
  values
    (v_lead1, v_trade, 'Lead One', '+18015550001', '84000', 'Within 30 days', 'qualified'),
    (v_lead2, v_trade, 'Lead Two', '+18015550002', '84000', 'Within 30 days', 'qualified'),
    (v_lead3, v_trade, 'Lead Three', '+18015550003', '84000', 'Within 30 days', 'qualified');

  -- First route picks the exclusive contractor and produces exactly one open offer.
  select r.offer_id, r.route_status into v_offer1, v_status
  from public.reserve_next_lead_offer(v_lead1, 60, 'hq1-test', 'hq1:test:lead1') r;

  if v_status <> 'offered' or v_offer1 is null then
    raise exception 'expected first lead to be offered, got %', v_status;
  end if;

  if (select contractor_id from public.lead_offers where id = v_offer1) <> v_c1 then
    raise exception 'exclusive contractor was not selected first';
  end if;

  select r.offer_id into v_offer1_replay
  from public.reserve_next_lead_offer(v_lead1, 60, 'hq1-test', 'hq1:test:lead1') r;

  if v_offer1_replay is distinct from v_offer1 then
    raise exception 'idempotent routing replay created a different offer';
  end if;

  select count(*) into v_count
  from public.lead_offers where lead_id = v_lead1 and status = 'offered';
  if v_count <> 1 then
    raise exception 'lead has % simultaneous open offers', v_count;
  end if;

  select a.assignment_id, a.transition_status into v_assignment1, v_status
  from public.accept_lead_offer(v_offer1, v_c1, 120, 'hq1-test') a;
  if v_status <> 'accepted' or v_assignment1 is null then
    raise exception 'offer acceptance failed: %', v_status;
  end if;

  -- Acceptance is idempotent and creates only one assignment.
  perform public.accept_lead_offer(v_offer1, v_c1, 120, 'hq1-test');
  select count(*) into v_count from public.lead_assignments where source_offer_id = v_offer1;
  if v_count <> 1 then
    raise exception 'accept replay produced % assignments', v_count;
  end if;

  perform public.mark_assignment_contacted(v_assignment1, v_c1, 'hq1-test');
  if not exists (
    select 1 from public.lead_assignments
    where id = v_assignment1 and contractor_contacted_homeowner_at is not null
  ) then
    raise exception 'contact transition was not recorded';
  end if;

  -- Offer expiry releases the lead; the prior contractor is excluded from the retry.
  select r.offer_id into v_offer2a
  from public.reserve_next_lead_offer(v_lead2, 60, 'hq1-test', 'hq1:test:lead2:first') r;
  update public.lead_offers set expires_at = now() - interval '1 minute' where id = v_offer2a;
  perform public.release_overdue_routing_work(10, 'hq1-test');

  select r.offer_id into v_offer2b
  from public.reserve_next_lead_offer(v_lead2, 60, 'hq1-test', 'hq1:test:lead2:second') r;
  if v_offer2b is null then
    raise exception 'expired lead was not reroutable';
  end if;
  if (select contractor_id from public.lead_offers where id = v_offer2b) <> v_c2 then
    raise exception 'expired offer retried the same contractor instead of next eligible contractor';
  end if;

  -- Contact-SLA miss explicitly rescues the accepted assignment before a new offer is allowed.
  select r.offer_id into v_offer3a
  from public.reserve_next_lead_offer(v_lead3, 60, 'hq1-test', 'hq1:test:lead3:first') r;
  select a.assignment_id into v_assignment3
  from public.accept_lead_offer(v_offer3a, v_c1, 120, 'hq1-test') a;
  update public.lead_offers set contact_due_at = now() - interval '1 minute' where id = v_offer3a;

  perform public.release_overdue_routing_work(10, 'hq1-test');

  if (select status from public.lead_offers where id = v_offer3a) <> 'rescued' then
    raise exception 'missed contact SLA did not rescue offer';
  end if;
  if (select outcome from public.lead_assignments where id = v_assignment3) <> 'expired' then
    raise exception 'rescued assignment was not released';
  end if;

  select r.offer_id into v_offer3b
  from public.reserve_next_lead_offer(v_lead3, 60, 'hq1-test', 'hq1:test:lead3:second') r;
  if (select contractor_id from public.lead_offers where id = v_offer3b) <> v_c2 then
    raise exception 'rescued lead was not routed to the next contractor';
  end if;

  -- Creating/accepting offers must not create a PPL debit by itself.
  if exists (
    select 1 from public.wallet_ledger
    where lead_id in (v_lead1, v_lead2, v_lead3) and entry_type = 'lead_debit'
  ) then
    raise exception 'routing or acceptance performed an unauthorized lead debit';
  end if;
end;
$$;

rollback;

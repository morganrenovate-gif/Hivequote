-- HQ-1 notification outbox invariants.
-- Disposable/local/staging only. All writes roll back.

begin;

do $$
declare
  v_trade uuid := gen_random_uuid();
  v_contractor uuid := gen_random_uuid();
  v_lead1 uuid := gen_random_uuid();
  v_lead2 uuid := gen_random_uuid();
  v_offer1 uuid;
  v_offer2 uuid;
  v_outbox uuid;
  v_claimed uuid;
  v_status text;
  v_count integer;
begin
  insert into public.trades (id, slug, name, ppl_price_cents, is_active)
  values (v_trade, 'hq1-outbox-' || replace(v_trade::text, '-', ''), 'HQ1 Outbox Trade', 2500, true);

  insert into public.contractors (
    id, business_name, phone, email, ghl_contact_id, status, license_status,
    capacity_status, billing_model, leads_delivered_this_month, total_leads_delivered
  ) values (
    v_contractor, 'HQ1 Outbox Contractor', '+18010000004', 'hq1-outbox@example.invalid',
    'ghl-synthetic-contact', 'active', 'active', 'available', 'ppl', 0, 0
  );

  insert into public.contractor_service_areas (contractor_id, trade_id, zip_code, is_exclusive_zone)
  values (v_contractor, v_trade, '84002', false);

  perform public.post_wallet_entry(
    v_contractor, 10000, 'funding', 'synthetic', 'outbox-fund-' || v_contractor::text,
    null, null, 'HQ1 notification test', 'hq1-test'
  );

  insert into public.leads (id, trade_id, first_name, phone, zip_code, timeline, status)
  values
    (v_lead1, v_trade, 'Outbox One', '+18015550005', '84002', 'Within 30 days', 'qualified'),
    (v_lead2, v_trade, 'Outbox Two', '+18015550006', '84002', 'Within 30 days', 'qualified');

  select r.offer_id into v_offer1
  from public.reserve_next_lead_offer(v_lead1, 60, 'hq1-test', 'hq1:outbox:first') r;

  select id into v_outbox
  from public.routing_notification_outbox
  where offer_id = v_offer1 and notification_type = 'offer_created';

  if v_outbox is null then
    raise exception 'offer creation did not enqueue notification';
  end if;

  select count(*) into v_count
  from public.routing_notification_outbox
  where offer_id = v_offer1 and notification_type = 'offer_created';
  if v_count <> 1 then
    raise exception 'offer created % notification jobs instead of one', v_count;
  end if;

  select c.outbox_id into v_claimed
  from public.claim_next_routing_notification(120, 'hq1-test') c;
  if v_claimed is distinct from v_outbox then
    raise exception 'worker did not claim expected outbox job';
  end if;

  select public.complete_routing_notification(
    v_outbox, false, 'synthetic', null, 'synthetic delivery failure', 'hq1-test'
  ) into v_status;
  if v_status <> 'failed' then
    raise exception 'failed delivery did not enter retry state: %', v_status;
  end if;

  update public.routing_notification_outbox set available_at = now() where id = v_outbox;
  select c.outbox_id into v_claimed
  from public.claim_next_routing_notification(120, 'hq1-test') c;
  if v_claimed is distinct from v_outbox then
    raise exception 'failed notification was not reclaimable';
  end if;

  select public.complete_routing_notification(
    v_outbox, true, 'synthetic', 'synthetic-message-1', null, 'hq1-test'
  ) into v_status;
  if v_status <> 'sent' then
    raise exception 'successful delivery did not settle sent: %', v_status;
  end if;

  select public.complete_routing_notification(
    v_outbox, true, 'synthetic', 'synthetic-message-1', null, 'hq1-test'
  ) into v_status;
  if v_status <> 'already_sent' then
    raise exception 'completion replay was not idempotent: %', v_status;
  end if;

  -- A declined offer must cancel its undelivered outbox job.
  select r.offer_id into v_offer2
  from public.reserve_next_lead_offer(v_lead2, 60, 'hq1-test', 'hq1:outbox:second') r;
  perform public.decline_lead_offer(v_offer2, v_contractor, 'synthetic decline', 'hq1-test');

  if (select status from public.routing_notification_outbox where offer_id = v_offer2) <> 'cancelled' then
    raise exception 'declined offer left a deliverable notification behind';
  end if;

  -- Delivery-only automation must not create assignments or lead debits.
  if exists (select 1 from public.lead_assignments where lead_id in (v_lead1, v_lead2)) then
    raise exception 'notification delivery created an assignment';
  end if;
  if exists (
    select 1 from public.wallet_ledger
    where lead_id in (v_lead1, v_lead2) and entry_type = 'lead_debit'
  ) then
    raise exception 'notification delivery created a lead debit';
  end if;
end;
$$;

rollback;

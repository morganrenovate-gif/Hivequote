-- HQ-1 routing notification outbox.
-- External automation may deliver notifications, but it does not own routing, assignment, or billing state.

create table if not exists public.routing_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.lead_offers(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id) on delete restrict,
  notification_type text not null check (notification_type in ('offer_created','offer_reminder')),
  channel text not null default 'sms' check (channel in ('sms','email','both')),
  status text not null default 'pending' check (status in ('pending','claimed','sent','failed','cancelled')),
  attempt_count integer not null default 0,
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  lease_until timestamptz,
  sent_at timestamptz,
  provider text,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, notification_type)
);

create index if not exists routing_notification_pending_idx
  on public.routing_notification_outbox (status, available_at, created_at)
  where status in ('pending','failed','claimed');

alter table public.routing_notification_outbox enable row level security;
-- No client policies. Service role and protected server endpoints own delivery state.

create or replace function public.enqueue_offer_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'offered' then
    insert into public.routing_notification_outbox (
      offer_id, contractor_id, notification_type, channel, status, available_at
    ) values (
      new.id, new.contractor_id, 'offer_created', 'sms', 'pending', now()
    )
    on conflict (offer_id, notification_type) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.cancel_stale_offer_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'offered' and new.status <> 'offered' then
    update public.routing_notification_outbox
      set status = 'cancelled',
          lease_until = null,
          updated_at = now(),
          last_error = case
            when status in ('pending','failed','claimed') then 'offer no longer active'
            else last_error
          end
    where offer_id = new.id
      and status in ('pending','failed','claimed');
  end if;
  return new;
end;
$$;

drop trigger if exists lead_offer_enqueue_notification on public.lead_offers;
create trigger lead_offer_enqueue_notification
  after insert on public.lead_offers
  for each row execute function public.enqueue_offer_notification();

drop trigger if exists lead_offer_cancel_notification on public.lead_offers;
create trigger lead_offer_cancel_notification
  after update of status on public.lead_offers
  for each row execute function public.cancel_stale_offer_notifications();

create or replace function public.claim_next_routing_notification(
  p_lease_seconds integer default 120,
  p_worker text default 'automation'
)
returns table(
  outbox_id uuid,
  offer_id uuid,
  contractor_id uuid,
  contractor_business_name text,
  contractor_phone text,
  contractor_email text,
  contractor_ghl_contact_id text,
  lead_id uuid,
  trade_name text,
  homeowner_first_name text,
  homeowner_last_name text,
  homeowner_phone text,
  zip_code text,
  timeline text,
  budget_range text,
  project_description text,
  offer_expires_at timestamptz,
  attempt_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.routing_notification_outbox%rowtype;
begin
  if p_lease_seconds < 30 or p_lease_seconds > 1800 then
    raise exception 'lease must be between 30 and 1800 seconds';
  end if;

  -- Recover abandoned leases before claiming the next job.
  update public.routing_notification_outbox o
    set status = 'pending',
        lease_until = null,
        last_error = coalesce(o.last_error, 'delivery lease expired'),
        updated_at = now()
  where o.status = 'claimed'
    and o.lease_until is not null
    and o.lease_until <= now()
    and o.attempt_count < 5
    and exists (
      select 1 from public.lead_offers lo
      where lo.id = o.offer_id
        and lo.status = 'offered'
        and lo.expires_at > now()
    );

  select o.* into v_job
  from public.routing_notification_outbox o
  join public.lead_offers lo on lo.id = o.offer_id
  where o.status in ('pending','failed')
    and o.available_at <= now()
    and o.attempt_count < 5
    and lo.status = 'offered'
    and lo.expires_at > now()
  order by o.available_at asc, o.created_at asc
  limit 1
  for update of o skip locked;

  if not found then
    return;
  end if;

  update public.routing_notification_outbox o
    set status = 'claimed',
        claimed_at = now(),
        lease_until = now() + make_interval(secs => p_lease_seconds),
        attempt_count = o.attempt_count + 1,
        last_error = null,
        updated_at = now()
  where o.id = v_job.id;

  insert into public.routing_events (
    lead_id, offer_id, contractor_id, event_type, event_data, triggered_by,
    idempotency_key
  )
  select lo.lead_id, lo.id, lo.contractor_id, 'notification_claimed',
         jsonb_build_object('outbox_id', v_job.id, 'attempt', v_job.attempt_count + 1),
         p_worker,
         v_job.id::text || ':claim:' || (v_job.attempt_count + 1)::text
  from public.lead_offers lo
  where lo.id = v_job.offer_id
  on conflict (idempotency_key) do nothing;

  return query
  select
    v_job.id,
    lo.id,
    c.id,
    c.business_name,
    c.phone,
    c.email,
    c.ghl_contact_id,
    l.id,
    t.name,
    l.first_name,
    l.last_name,
    l.phone,
    l.zip_code,
    l.timeline,
    l.budget_range,
    l.project_description,
    lo.expires_at,
    v_job.attempt_count + 1
  from public.lead_offers lo
  join public.contractors c on c.id = lo.contractor_id
  join public.leads l on l.id = lo.lead_id
  join public.trades t on t.id = l.trade_id
  where lo.id = v_job.offer_id;
end;
$$;

create or replace function public.complete_routing_notification(
  p_outbox_id uuid,
  p_success boolean,
  p_provider text default null,
  p_provider_message_id text default null,
  p_error text default null,
  p_worker text default 'automation'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.routing_notification_outbox%rowtype;
  v_offer public.lead_offers%rowtype;
  v_assignment_id uuid;
begin
  select * into v_job
  from public.routing_notification_outbox
  where id = p_outbox_id
  for update;

  if not found then
    raise exception 'notification job not found';
  end if;

  if v_job.status = 'sent' then
    return 'already_sent';
  end if;

  if v_job.status = 'cancelled' then
    return 'cancelled';
  end if;

  if v_job.status <> 'claimed' then
    raise exception 'notification job is not claimed';
  end if;

  select * into v_offer from public.lead_offers where id = v_job.offer_id;

  if p_success then
    if v_offer.status <> 'offered' or v_offer.expires_at <= now() then
      update public.routing_notification_outbox
        set status = 'cancelled', lease_until = null,
            last_error = 'delivery completed after offer became inactive', updated_at = now()
      where id = v_job.id;
      return 'cancelled';
    end if;

    update public.routing_notification_outbox
      set status = 'sent',
          sent_at = now(),
          lease_until = null,
          provider = left(p_provider, 50),
          provider_message_id = left(p_provider_message_id, 255),
          last_error = null,
          updated_at = now()
    where id = v_job.id;

    select la.id into v_assignment_id
    from public.lead_assignments la
    where la.source_offer_id = v_offer.id
    limit 1;

    if v_assignment_id is not null then
      update public.lead_assignments
        set notification_sent_at = coalesce(notification_sent_at, now()),
            notification_channel = coalesce(notification_channel, v_job.channel),
            updated_at = now()
      where id = v_assignment_id;
    end if;

    insert into public.routing_events (
      lead_id, offer_id, contractor_id, event_type, event_data, triggered_by,
      idempotency_key
    ) values (
      v_offer.lead_id, v_offer.id, v_offer.contractor_id, 'notification_sent',
      jsonb_build_object('outbox_id', v_job.id, 'provider', p_provider, 'provider_message_id', p_provider_message_id),
      p_worker, v_job.id::text || ':sent'
    ) on conflict (idempotency_key) do nothing;

    return 'sent';
  end if;

  update public.routing_notification_outbox o
    set status = 'failed',
        available_at = now() + make_interval(secs => least(900, greatest(30, 30 * o.attempt_count))),
        lease_until = null,
        provider = left(p_provider, 50),
        provider_message_id = left(p_provider_message_id, 255),
        last_error = left(coalesce(p_error, 'delivery failed'), 1000),
        updated_at = now()
  where o.id = v_job.id;

  insert into public.routing_events (
    lead_id, offer_id, contractor_id, event_type, event_data, triggered_by,
    idempotency_key
  ) values (
    v_offer.lead_id, v_offer.id, v_offer.contractor_id, 'notification_failed',
    jsonb_build_object('outbox_id', v_job.id, 'attempt', v_job.attempt_count, 'error', left(coalesce(p_error, 'delivery failed'), 1000)),
    p_worker, v_job.id::text || ':failed:' || v_job.attempt_count::text
  ) on conflict (idempotency_key) do nothing;

  return 'failed';
end;
$$;

revoke all on function public.enqueue_offer_notification() from public, anon, authenticated;
revoke all on function public.cancel_stale_offer_notifications() from public, anon, authenticated;
revoke all on function public.claim_next_routing_notification(integer, text) from public, anon, authenticated;
revoke all on function public.complete_routing_notification(uuid, boolean, text, text, text, text) from public, anon, authenticated;

grant execute on function public.claim_next_routing_notification(integer, text) to service_role;
grant execute on function public.complete_routing_notification(uuid, boolean, text, text, text, text) to service_role;

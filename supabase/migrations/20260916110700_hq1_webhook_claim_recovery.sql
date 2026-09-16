-- HQ-1 webhook claim recovery.
-- Makes event claiming atomic, replay-safe, and recoverable after a failed/stale processing attempt.

alter table public.webhook_events
  add column if not exists attempt_count integer not null default 1,
  add column if not exists last_attempt_at timestamptz not null default now();

create or replace function public.claim_webhook_event(
  p_provider text,
  p_event_id text,
  p_payload_sha256 text,
  p_stale_after_seconds integer default 300
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.webhook_events%rowtype;
begin
  if p_stale_after_seconds < 30 or p_stale_after_seconds > 86400 then
    raise exception 'stale window must be between 30 and 86400 seconds';
  end if;

  begin
    insert into public.webhook_events (
      provider, event_id, payload_sha256, status, attempt_count, last_attempt_at
    ) values (
      p_provider, p_event_id, p_payload_sha256, 'processing', 1, now()
    );
    return 'claimed';
  exception when unique_violation then
    null;
  end;

  select * into v_event
  from public.webhook_events
  where provider = p_provider and event_id = p_event_id
  for update;

  if not found then
    raise exception 'webhook claim conflict without existing row';
  end if;

  if v_event.payload_sha256 <> p_payload_sha256 then
    return 'payload_mismatch';
  end if;

  if v_event.status in ('processed','ignored') then
    return 'duplicate';
  end if;

  if v_event.status = 'failed'
     or (v_event.status = 'processing'
         and v_event.last_attempt_at <= now() - make_interval(secs => p_stale_after_seconds)) then
    update public.webhook_events
      set status = 'processing',
          error_text = null,
          processed_at = null,
          attempt_count = attempt_count + 1,
          last_attempt_at = now()
    where id = v_event.id;
    return 'claimed';
  end if;

  return 'duplicate';
end;
$$;

revoke all on function public.claim_webhook_event(text, text, text, integer) from public, anon, authenticated;
grant execute on function public.claim_webhook_event(text, text, text, integer) to service_role;

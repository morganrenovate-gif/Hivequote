-- HQ-1 privileged RPC permission hardening.
-- SECURITY DEFINER functions must never retain PostgreSQL's default PUBLIC execute grant.
-- Apply to staging first; production execution remains separately governed.

revoke all on function public.wallet_balance(uuid) from public, anon, authenticated;
revoke all on function public.post_wallet_entry(uuid, bigint, text, text, text, text, uuid, text, text) from public, anon, authenticated;

grant execute on function public.wallet_balance(uuid) to service_role;
grant execute on function public.post_wallet_entry(uuid, bigint, text, text, text, text, uuid, text, text) to service_role;

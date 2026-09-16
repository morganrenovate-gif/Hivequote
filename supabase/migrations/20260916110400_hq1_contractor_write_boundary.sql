-- HQ-1 contractor write boundary.
-- Contractors may read their own business row, but must mutate operational/business-critical fields
-- through server-authorized APIs. The previous row-wide UPDATE policy allowed status, billing,
-- Stripe identifiers, compliance fields, and routing controls to be self-modified.

 drop policy if exists contractor_update_own on public.contractors;

-- Intentionally no authenticated UPDATE policy on public.contractors.
-- Future profile-edit APIs should expose a narrow allowlist of user-editable fields server-side.

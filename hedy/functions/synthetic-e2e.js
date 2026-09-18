function fail(message, details) {
  return { status: 500, body: { ok: false, message, details: details || null } };
}
async function handler(ctx) {
  const fixture = String((ctx.schedule && ctx.schedule.payload && ctx.schedule.payload.fixture) || "qa1").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "qa1";
  const now = new Date().toISOString();
  const leadKey = "lead:e2e:" + fixture;
  const contractorA = "contractor:e2e:" + fixture + ":a";
  const contractorB = "contractor:e2e:" + fixture + ":b";
  const coverageKey = "roofing|84604";
  const offerKey = "offer:" + leadKey + ":000001";
  const assignmentKey = "assignment:" + leadKey + ":000001";
  await ctx.data.batchPut("contractors", [
    { key: contractorA, value: { id: contractorA, synthetic: true, businessName: "E2E Roofing A", status: "active", licenseStatus: "active", capacityStatus: "available", billingModel: "ppl", walletAvailableCents: 50000, leadsDeliveredThisMonth: 0, closeRatePct: 42, createdAt: now } },
    { key: contractorB, value: { id: contractorB, synthetic: true, businessName: "E2E Roofing B", status: "active", licenseStatus: "active", capacityStatus: "available", billingModel: "ppl", walletAvailableCents: 50000, leadsDeliveredThisMonth: 1, closeRatePct: 55, createdAt: now } }
  ]);
  await ctx.data.batchPut("coverage", [
    { key: "coverage:e2e:" + fixture + ":a", value: { synthetic: true, coverageKey, contractorId: contractorA, createdAt: now } },
    { key: "coverage:e2e:" + fixture + ":b", value: { synthetic: true, coverageKey, contractorId: contractorB, createdAt: now } }
  ]);
  await ctx.data.put("leads", leadKey, { id: leadKey, synthetic: true, coverageKey, tradeId: "roofing", zipCode: "84604", status: "qualified", pplPriceCents: 12500, routingAttempt: 0, offeredContractorIds: [], activeOfferKey: null, createdAt: now, updatedAt: now });
  const leadMeta = await ctx.data.getWithMeta("leads", leadKey);
  if (!leadMeta || leadMeta.value.status !== "qualified") return fail("seed_read_failed");
  const locked = { ...leadMeta.value, status: "routing", routingAttempt: 1, routingLock: { attempt: 1, expiresAt: new Date(Date.now() + 30000).toISOString() }, updatedAt: new Date().toISOString() };
  const lockWrite = await ctx.data.put("leads", leadKey, locked, { ifVersion: leadMeta.version });
  const coverage = await ctx.data.query("coverage", "bycoverage", { eq: coverageKey, limit: 20 });
  const contractorKeys = (coverage.items || []).map(x => x.value && x.value.contractorId).filter(Boolean);
  const batch = await ctx.data.batchGet("contractors", contractorKeys);
  const candidates = (batch.items || []).filter(x => x.found && x.value && x.value.synthetic === true).map(x => x.value)
    .filter(c => c.status === "active" && c.licenseStatus === "active" && c.capacityStatus === "available")
    .filter(c => Number(c.walletAvailableCents || 0) >= 12500)
    .sort((a,b) => Number(a.leadsDeliveredThisMonth || 0) - Number(b.leadsDeliveredThisMonth || 0) || Number(b.closeRatePct || 0) - Number(a.closeRatePct || 0));
  if (!candidates.length) return fail("no_candidate");
  const selected = candidates[0];
  if (selected.id !== contractorA) return fail("ranking_invariant_failed", { selected: selected.id, expected: contractorA });
  const offer = { id: offerKey, synthetic: true, leadId: leadKey, contractorId: selected.id, attempt: 1, status: "offered", pplPriceSnapshotCents: 12500, offeredAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() };
  await ctx.data.put("lead-offers", offerKey, offer, { ifNotExists: true });
  await ctx.data.put("leads", leadKey, { ...locked, status: "offer_pending", routingLock: null, activeOfferKey: offerKey, offeredContractorIds: [selected.id], updatedAt: new Date().toISOString() }, { ifVersion: lockWrite.version });
  const offerMeta = await ctx.data.getWithMeta("lead-offers", offerKey);
  const leadBeforeAccept = await ctx.data.getWithMeta("leads", leadKey);
  if (!offerMeta || !leadBeforeAccept || leadBeforeAccept.value.activeOfferKey !== offerKey) return fail("offer_state_missing");
  const acceptedAt = new Date().toISOString();
  await ctx.data.put("lead-offers", offerKey, { ...offerMeta.value, status: "accepted", acceptedAt, respondedAt: acceptedAt }, { ifVersion: offerMeta.version });
  const assignment = { id: assignmentKey, synthetic: true, leadId: leadKey, contractorId: selected.id, offerKey, status: "accepted", acceptedAt, contactDueAt: new Date(Date.now() + 7200000).toISOString(), pplCharged: false };
  await ctx.data.put("assignments", assignmentKey, assignment, { ifNotExists: true });
  await ctx.data.put("leads", leadKey, { ...leadBeforeAccept.value, status: "assigned", activeAssignmentId: assignmentKey, updatedAt: new Date().toISOString() }, { ifVersion: leadBeforeAccept.version });
  await ctx.data.put("routing-events", "event:" + leadKey + ":000001:offer-created", { synthetic: true, leadId: leadKey, offerId: offerKey, contractorId: selected.id, eventType: "offer_created", createdAt: acceptedAt }, { ifNotExists: true }).catch(() => {});
  await ctx.data.put("routing-events", "event:" + leadKey + ":000001:accepted", { synthetic: true, leadId: leadKey, offerId: offerKey, contractorId: selected.id, assignmentId: assignmentKey, eventType: "offer_accepted", createdAt: acceptedAt }, { ifNotExists: true }).catch(() => {});
  const finalLead = await ctx.data.get("leads", leadKey);
  const finalOffer = await ctx.data.get("lead-offers", offerKey);
  const finalAssignment = await ctx.data.get("assignments", assignmentKey);
  if (!finalLead || finalLead.status !== "assigned" || finalLead.activeAssignmentId !== assignmentKey) return fail("final_lead_invariant_failed", finalLead);
  if (!finalOffer || finalOffer.status !== "accepted") return fail("final_offer_invariant_failed", finalOffer);
  if (!finalAssignment || finalAssignment.pplCharged !== false) return fail("assignment_money_invariant_failed", finalAssignment);
  return { status: 200, body: { ok: true, fixture, leadKey, offerKey, assignmentKey, selectedContractorId: selected.id, invariants: { oneSelectedContractor: true, casLeadLock: true, acceptedAssignment: true, pplCharged: false } } };
}

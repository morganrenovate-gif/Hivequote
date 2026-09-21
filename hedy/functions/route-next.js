function response(status, body) { return { status, body }; }
function offerKeyFor(leadKey, attempt) { return "offer:" + leadKey + ":" + String(attempt).padStart(6, "0"); }
async function handler(ctx) {
  let body = {};
  try { body = JSON.parse(ctx.request.body || "{}"); } catch { return response(400, { error: "invalid_json" }); }
  const leadKey = String(body.leadKey || "");
  if (!leadKey) return response(400, { error: "leadKey_required" });
  let meta = await ctx.data.getWithMeta("leads", leadKey);
  if (!meta) return response(404, { error: "lead_not_found" });
  let lead = meta.value;
  if (!lead || lead.synthetic !== true) return response(403, { error: "synthetic_only" });
  if (lead.activeOfferKey) {
    const existing = await ctx.data.get("lead-offers", lead.activeOfferKey);
    if (existing && existing.status === "offered" && new Date(existing.expiresAt).getTime() > Date.now()) {
      return response(200, { ok: true, routeStatus: "existing_offer", offer: existing });
    }
  }
  let nextAttempt = Number(lead.routingAttempt || 0) + 1;
  if (lead.status === "routing" && lead.routingLock && Number(lead.routingAttempt || 0) > 0) {
    const inFlightAttempt = Number(lead.routingAttempt);
    const inFlightOfferKey = offerKeyFor(leadKey, inFlightAttempt);
    const inFlightOffer = await ctx.data.get("lead-offers", inFlightOfferKey);
    if (inFlightOffer && inFlightOffer.synthetic === true && inFlightOffer.status === "offered") {
      const repaired = { ...lead, status: "offer_pending", activeOfferKey: inFlightOfferKey, routingLock: null, updatedAt: new Date().toISOString() };
      try {
        await ctx.data.put("leads", leadKey, repaired, { ifVersion: meta.version });
        return response(200, { ok: true, routeStatus: "reconciled_offer", offer: inFlightOffer });
      } catch (err) {
        if (err && err.name === "ConflictError") return response(409, { error: "reconcile_conflict", retry: true });
        throw err;
      }
    }
    const lockExpiry = new Date(lead.routingLock.expiresAt || 0).getTime();
    if (lockExpiry > Date.now()) return response(409, { error: "routing_in_progress", retry: true });
    nextAttempt = inFlightAttempt;
  }
  const lockUntil = new Date(Date.now() + 30000).toISOString();
  const locked = { ...lead, status: "routing", routingAttempt: nextAttempt, routingLock: { attempt: nextAttempt, expiresAt: lockUntil }, activeOfferKey: null, updatedAt: new Date().toISOString() };
  let lockWrite;
  try { lockWrite = await ctx.data.put("leads", leadKey, locked, { ifVersion: meta.version }); }
  catch (err) {
    if (err && err.name === "ConflictError") return response(409, { error: "routing_conflict", retry: true });
    throw err;
  }
  const coverage = await ctx.data.query("coverage", "bycoverage", { eq: lead.coverageKey, limit: 100 });
  const coverageItems = (coverage.items || []).filter(x => x.value && x.value.synthetic === true);
  const contractorKeys = coverageItems.map(x => x.value.contractorId);
  const batch = contractorKeys.length ? await ctx.data.batchGet("contractors", contractorKeys) : { items: [] };
  const offered = new Set(Array.isArray(lead.offeredContractorIds) ? lead.offeredContractorIds : []);
  const candidates = (batch.items || [])
    .filter(x => x.found && x.value && x.value.synthetic === true)
    .map(x => x.value)
    .filter(c => c.status === "active" && c.licenseStatus === "active" && ["available","limited"].includes(c.capacityStatus))
    .filter(c => !offered.has(c.id))
    .filter(c => c.billingModel !== "ppl" || Number(c.walletAvailableCents || 0) >= Number(lead.pplPriceCents || 0))
    .sort((a,b) => Number(a.leadsDeliveredThisMonth || 0) - Number(b.leadsDeliveredThisMonth || 0) || Number(b.closeRatePct || 0) - Number(a.closeRatePct || 0) || String(a.id).localeCompare(String(b.id)));
  if (!candidates.length) {
    const failed = { ...locked, status: "routing_failed", routingLock: null, activeOfferKey: null, updatedAt: new Date().toISOString() };
    try { await ctx.data.put("leads", leadKey, failed, { ifVersion: lockWrite.version }); } catch {}
    const eventKey = "event:" + leadKey + ":" + String(nextAttempt).padStart(6,"0") + ":no-match";
    await ctx.data.put("routing-events", eventKey, { synthetic: true, leadId: leadKey, eventType: "routing_no_match", attempt: nextAttempt, createdAt: new Date().toISOString() }, { ifNotExists: true }).catch(() => {});
    return response(200, { ok: true, routeStatus: "no_match", attempt: nextAttempt });
  }
  const contractor = candidates[0];
  const offerKey = offerKeyFor(leadKey, nextAttempt);
  const now = new Date();
  const offer = { id: offerKey, synthetic: true, leadId: leadKey, contractorId: contractor.id, attempt: nextAttempt, status: "offered", pplPriceSnapshotCents: Number(lead.pplPriceCents || 0), offeredAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60 * 60000).toISOString() };
  try { await ctx.data.put("lead-offers", offerKey, offer, { ifNotExists: true }); }
  catch (err) { if (!(err && err.name === "ConflictError")) throw err; }
  const actualOffer = await ctx.data.get("lead-offers", offerKey);
  if (!actualOffer || actualOffer.synthetic !== true || actualOffer.status !== "offered") {
    const failed = { ...locked, status: "routing_failed", routingLock: null, updatedAt: new Date().toISOString() };
    await ctx.data.put("leads", leadKey, failed, { ifVersion: lockWrite.version }).catch(() => {});
    return response(409, { error: "offer_reconciliation_failed", retry: true });
  }
  const routed = { ...locked, status: "offer_pending", routingLock: null, activeOfferKey: offerKey, offeredContractorIds: [...offered, contractor.id], updatedAt: new Date().toISOString() };
  try { await ctx.data.put("leads", leadKey, routed, { ifVersion: lockWrite.version }); }
  catch (err) {
    await ctx.data.put("lead-offers", offerKey, { ...actualOffer, status: "cancelled", cancelReason: "lead_state_conflict", updatedAt: new Date().toISOString() }).catch(() => {});
    if (err && err.name === "ConflictError") return response(409, { error: "lead_state_conflict", retry: true });
    throw err;
  }
  const eventKey = "event:" + leadKey + ":" + String(nextAttempt).padStart(6,"0") + ":offer-created";
  await ctx.data.put("routing-events", eventKey, { synthetic: true, leadId: leadKey, offerId: offerKey, contractorId: contractor.id, eventType: "offer_created", attempt: nextAttempt, createdAt: new Date().toISOString() }, { ifNotExists: true }).catch(() => {});
  return response(200, { ok: true, routeStatus: "offered", offer: actualOffer, contractor: { id: contractor.id, businessName: contractor.businessName } });
}

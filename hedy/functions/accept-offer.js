function response(status, body) { return { status, body }; }
function assignmentKeyFor(offer) { return "assignment:" + offer.leadId + ":" + String(offer.attempt).padStart(6, "0"); }
async function reconcileAccepted(ctx, offerKey, offer) {
  const assignmentId = assignmentKeyFor(offer);
  let assignment = await ctx.data.get("assignments", assignmentId);
  if (!assignment) {
    assignment = { id: assignmentId, synthetic: true, leadId: offer.leadId, contractorId: offer.contractorId, offerKey, status: "accepted", acceptedAt: offer.acceptedAt || new Date().toISOString(), contactDueAt: new Date(Date.now() + 2 * 60 * 60000).toISOString(), pplCharged: false };
    await ctx.data.put("assignments", assignmentId, assignment, { ifNotExists: true }).catch(() => {});
    assignment = await ctx.data.get("assignments", assignmentId) || assignment;
  }
  const leadMeta = await ctx.data.getWithMeta("leads", offer.leadId);
  if (leadMeta && leadMeta.value && leadMeta.value.synthetic === true && leadMeta.value.activeAssignmentId !== assignmentId) {
    const nextLead = { ...leadMeta.value, status: "assigned", activeOfferKey: offerKey, activeAssignmentId: assignmentId, updatedAt: new Date().toISOString() };
    await ctx.data.put("leads", offer.leadId, nextLead, { ifVersion: leadMeta.version }).catch(() => {});
  }
  return assignment;
}
async function handler(ctx) {
  let body = {};
  try { body = JSON.parse(ctx.request.body || "{}"); } catch { return response(400, { error: "invalid_json" }); }
  const offerKey = String(body.offerKey || "");
  const contractorId = String(body.contractorId || "");
  if (!offerKey || !contractorId) return response(400, { error: "offerKey_and_contractorId_required" });
  let offerMeta = await ctx.data.getWithMeta("lead-offers", offerKey);
  if (!offerMeta) return response(404, { error: "offer_not_found" });
  let offer = offerMeta.value;
  if (!offer || offer.synthetic !== true) return response(403, { error: "synthetic_only" });
  if (offer.contractorId !== contractorId) return response(403, { error: "wrong_contractor" });
  if (offer.status === "accepted") {
    const assignment = await reconcileAccepted(ctx, offerKey, offer);
    return response(200, { ok: true, transitionStatus: "already_accepted_reconciled", assignment });
  }
  if (offer.status !== "offered") return response(409, { error: "offer_not_open", status: offer.status });
  if (new Date(offer.expiresAt).getTime() <= Date.now()) {
    try { await ctx.data.put("lead-offers", offerKey, { ...offer, status: "expired", respondedAt: new Date().toISOString() }, { ifVersion: offerMeta.version }); } catch {}
    return response(409, { error: "offer_expired" });
  }
  const leadMeta = await ctx.data.getWithMeta("leads", offer.leadId);
  if (!leadMeta || !leadMeta.value || leadMeta.value.synthetic !== true) return response(409, { error: "lead_missing" });
  if (leadMeta.value.activeOfferKey !== offerKey) return response(409, { error: "offer_not_active_for_lead" });
  const acceptedAt = new Date().toISOString();
  let offerWrite;
  try { offerWrite = await ctx.data.put("lead-offers", offerKey, { ...offer, status: "accepted", acceptedAt, respondedAt: acceptedAt }, { ifVersion: offerMeta.version }); }
  catch (err) {
    if (err && err.name === "ConflictError") {
      const current = await ctx.data.get("lead-offers", offerKey);
      if (current && current.status === "accepted") {
        const assignment = await reconcileAccepted(ctx, offerKey, current);
        return response(200, { ok: true, transitionStatus: "accepted_after_conflict", assignment });
      }
      return response(409, { error: "offer_conflict", retry: true });
    }
    throw err;
  }
  offer = await ctx.data.get("lead-offers", offerKey);
  const assignment = await reconcileAccepted(ctx, offerKey, offer);
  const verifyLead = await ctx.data.get("leads", offer.leadId);
  if (!verifyLead || verifyLead.activeAssignmentId !== assignment.id) {
    await ctx.data.put("lead-offers", offerKey, { ...offer, status: "offered", rollbackReason: "lead_accept_reconcile_failed", updatedAt: new Date().toISOString() }, { ifVersion: offerWrite.version }).catch(() => {});
    return response(409, { error: "lead_accept_reconcile_failed", retry: true });
  }
  const eventKey = "event:" + offer.leadId + ":" + String(offer.attempt).padStart(6,"0") + ":accepted";
  await ctx.data.put("routing-events", eventKey, { synthetic: true, leadId: offer.leadId, offerId: offerKey, contractorId, assignmentId: assignment.id, eventType: "offer_accepted", createdAt: new Date().toISOString() }, { ifNotExists: true }).catch(() => {});
  return response(200, { ok: true, transitionStatus: "accepted", assignment });
}

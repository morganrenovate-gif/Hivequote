async function handler(ctx) {
  const leadKey = String((ctx.request.query && ctx.request.query.leadKey) || "");
  if (!leadKey) return { status: 400, body: { error: "leadKey_required" } };
  const lead = await ctx.data.get("leads", leadKey);
  if (!lead) return { status: 404, body: { error: "lead_not_found" } };
  if (lead.synthetic !== true) return { status: 403, body: { error: "synthetic_only" } };
  const offers = await ctx.data.query("lead-offers", "bylead", { eq: leadKey, order: "asc", limit: 100 });
  const events = await ctx.data.query("routing-events", "bylead", { eq: leadKey, order: "asc", limit: 100 });
  let assignment = null;
  if (lead.activeAssignmentId) assignment = await ctx.data.get("assignments", lead.activeAssignmentId);
  return { status: 200, body: { ok: true, lead, offers: (offers.items || []).map(x => x.value), events: (events.items || []).map(x => x.value), assignment } };
}

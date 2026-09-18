async function handler(ctx) {
  let body = {};
  try { body = JSON.parse(ctx.request.body || "{}"); } catch { return { status: 400, body: { error: "invalid_json" } }; }
  const fixture = String(body.fixture || "default").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "default";
  const now = new Date().toISOString();
  const leadKey = "lead:" + fixture;
  const contractorA = "contractor:" + fixture + ":a";
  const contractorB = "contractor:" + fixture + ":b";
  const coverageKey = "roofing|84604";
  await ctx.data.batchPut("contractors", [
    { key: contractorA, value: { id: contractorA, synthetic: true, businessName: "Synthetic Roofing A", status: "active", licenseStatus: "active", capacityStatus: "available", billingModel: "ppl", walletAvailableCents: 50000, leadsDeliveredThisMonth: 0, closeRatePct: 42, createdAt: now } },
    { key: contractorB, value: { id: contractorB, synthetic: true, businessName: "Synthetic Roofing B", status: "active", licenseStatus: "active", capacityStatus: "available", billingModel: "ppl", walletAvailableCents: 50000, leadsDeliveredThisMonth: 1, closeRatePct: 55, createdAt: now } }
  ]);
  await ctx.data.batchPut("coverage", [
    { key: "coverage:" + fixture + ":a", value: { synthetic: true, coverageKey, contractorId: contractorA, isExclusiveZone: false, createdAt: now } },
    { key: "coverage:" + fixture + ":b", value: { synthetic: true, coverageKey, contractorId: contractorB, isExclusiveZone: false, createdAt: now } }
  ]);
  await ctx.data.put("leads", leadKey, {
    id: leadKey, synthetic: true, firstName: "Synthetic", lastName: "Homeowner", phone: "5550000000",
    tradeId: "roofing", zipCode: "84604", coverageKey, status: "qualified",
    pplPriceCents: 12500, routingAttempt: 0, offeredContractorIds: [], activeOfferKey: null,
    routingLock: null, createdAt: now, updatedAt: now
  });
  await ctx.data.put("system-config", "mode", { syntheticOnly: true, backend: "hedy", updatedAt: now });
  return { status: 200, body: { ok: true, fixture, leadKey, contractorIds: [contractorA, contractorB] } };
}

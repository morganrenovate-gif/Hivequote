async function handler(ctx) {
  return { status: 200, body: { ok: true, service: "hivequote-core", backend: "hedy", supabase: false, mode: "synthetic-staging", now: new Date().toISOString() } };
}

import { normalizePhone } from './tcpa'

/**
 * Lead deduplication — Section 2.2C. Same phone + trade within a
 * 72-hour window is a duplicate: suppress, never charge a contractor.
 * The database enforces this with a unique partial index; this helper
 * provides the application-level pre-check (and powers mock mode).
 */
export const DEDUP_WINDOW_HOURS = 72

export function isDuplicateLead(
  existing: { phone: string; trade_slug: string; created_at: string }[],
  candidate: { phone: string; trade_slug: string }
): boolean {
  const phone = normalizePhone(candidate.phone)
  const cutoff = Date.now() - DEDUP_WINDOW_HOURS * 3600000
  return existing.some(
    (l) =>
      normalizePhone(l.phone) === phone &&
      l.trade_slug === candidate.trade_slug &&
      new Date(l.created_at).getTime() > cutoff
  )
}

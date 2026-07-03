/**
 * Contractor matching — Section 2.2C routing rules.
 * Sort order: (1) wallet has balance, (2) exclusivity zone match,
 * (3) fewest leads delivered this month (load balancing),
 * (4) highest review score.
 */
export interface RoutableContractor {
  id: string
  trade_slug: string
  zips: string[]
  wallet_balance_cents: number
  ppl_price_cents: number
  has_exclusive_zone?: boolean
  leads_delivered_this_month: number
  rating: number
  status: string
}

export function matchContractor(
  contractors: RoutableContractor[],
  lead: { trade_slug: string; zip_code: string }
): RoutableContractor | null {
  const candidates = contractors.filter(
    (c) =>
      c.status === 'active' &&
      c.trade_slug === lead.trade_slug &&
      c.zips.includes(lead.zip_code)
  )
  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    const aFunded = a.wallet_balance_cents >= a.ppl_price_cents ? 1 : 0
    const bFunded = b.wallet_balance_cents >= b.ppl_price_cents ? 1 : 0
    if (aFunded !== bFunded) return bFunded - aFunded

    const aExcl = a.has_exclusive_zone ? 1 : 0
    const bExcl = b.has_exclusive_zone ? 1 : 0
    if (aExcl !== bExcl) return bExcl - aExcl

    if (a.leads_delivered_this_month !== b.leads_delivered_this_month)
      return a.leads_delivered_this_month - b.leads_delivered_this_month

    return b.rating - a.rating
  })

  return candidates[0]
}

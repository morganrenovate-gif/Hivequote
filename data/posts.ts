export interface Post {
  slug: string
  title: string
  description: string
  date: string
  tradeSlug: string
  readMinutes: number
  body: string[]
}

export const POSTS: Post[] = [
  {
    slug: 'epoxy-garage-floor-cost-utah',
    title: 'How Much Does an Epoxy Garage Floor Cost in Utah? (2026 Guide)',
    description:
      'Real pricing for epoxy and polyaspartic garage floors along the Wasatch Front — by garage size, coating system, and prep quality.',
    date: '2026-06-15',
    tradeSlug: 'epoxy-residential',
    readMinutes: 6,
    body: [
      'A 2-car garage floor coating in Utah typically runs $1,500–$2,800 installed; a 3-car garage runs $2,200–$4,000. The spread comes down to three things: the coating system, the prep method, and crack repair scope.',
      'System matters most. Cheap single-coat epoxy kits fail fast in Utah because our freeze-thaw cycles and road salt punish thin coatings. Quality installers use an epoxy or polyurea base coat with a polyaspartic top coat — that hybrid handles hot tires, salt, and UV without yellowing.',
      'Prep is where corners get cut. Acid etching is not enough. Insist on diamond grinding, moisture testing, and full crack repair before any coating goes down. If a bid is dramatically cheaper than the others, prep is almost always the reason.',
      'Timing tip: April through October is peak season and installers book out weeks in advance. Heated garages can be coated year-round, and many Utah installers offer 10%+ off-season discounts January–March.',
      'Want an exact number? HiveQuote matches you with one certified Utah epoxy installer — with verified prep standards — for a free quote. No shared leads, no spam calls.',
    ],
  },
  {
    slug: 'ev-charger-installation-cost-utah',
    title: 'EV Charger Installation in Utah: Costs, Permits, and Panel Upgrades',
    description:
      'What Utah homeowners actually pay for Level 2 EV charger installation — and when a panel upgrade changes the math.',
    date: '2026-06-01',
    tradeSlug: 'electrician',
    readMinutes: 5,
    body: [
      'A straightforward Level 2 charger install in Utah runs $600–$1,400 when your panel has capacity and the garage is close to the panel. Long conduit runs, finished walls, or detached garages push that to $1,500–$2,500.',
      'The big variable is your electrical panel. Homes built before the mid-90s often have 100-amp service that cannot absorb a 40–50 amp charger circuit. A panel upgrade to 200 amps adds $2,000–$4,500 — and requires a licensed electrician and a city permit, full stop.',
      'Rocky Mountain Power offers time-of-use rates that make overnight charging dramatically cheaper. Your electrician can wire the charger to take advantage of it.',
      'Permits are not optional in Utah municipalities — an unpermitted install can void insurance coverage and complicate a home sale. Any electrician worth hiring pulls the permit as part of the job.',
      'HiveQuote matches your EV charger project with one DOPL-licensed Utah electrician, exclusively. Free for homeowners.',
    ],
  },
  {
    slug: 'pickleball-court-resurfacing-guide-utah',
    title: 'Pickleball Court Resurfacing in Utah: When, How, and What It Costs',
    description:
      'Cracks, fading, and dead spots — a Utah homeowner and HOA guide to acrylic court resurfacing, from prep to pricing.',
    date: '2026-05-20',
    tradeSlug: 'pickleball-resurfacing',
    readMinutes: 7,
    body: [
      'Utah has more pickleball courts per capita than any state — and our freeze-thaw climate cracks them faster than anywhere else. Most courts need resurfacing every 4–7 years.',
      'Typical Utah pricing: a single-court resurface with minor crack repair runs $2,500–$4,500. Heavy structural crack repair, or color changes with multiple coats, pushes projects to $6,000–$8,000. Multi-court HOA jobs get better per-court pricing.',
      'The process: pressure wash, crack rout-and-fill (or membrane systems for recurring cracks), acrylic resurfacer coats, two color coats, then line striping. Done right it takes 3–5 days of warm, dry weather.',
      'Timing matters. Acrylic coatings need overnight temps above 50°F — the Utah window is roughly April 15 to October 15 along the Wasatch Front. Book in late winter; specialist crews fill their calendars by May.',
      'Red flag: contractors who quote without seeing the cracks. Structural cracks that are simply filled and painted over telegraph back through the new surface in one winter.',
      'HiveQuote matches your court with one Utah resurfacing specialist — the same pros trusted by HOAs and clubs across the valley.',
    ],
  },
]

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug)
}

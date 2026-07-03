export interface Trade {
  slug: string
  name: string
  shortName: string
  subBrand: string
  icon: string
  pplPriceCents: number
  ppcFeeCents: number
  avgJobValueLow: number
  avgJobValueHigh: number
  isAnchor: boolean
  isSeasonal: boolean
  headline: string
  subheadline: string
  description: string
  projectTypes: string[]
  faqs: { q: string; a: string }[]
}

export const TRADES: Trade[] = [
  {
    slug: 'electrician',
    name: 'Electrician',
    shortName: 'Electrical',
    subBrand: 'HiveQuote Electrical',
    icon: '⚡',
    pplPriceCents: 6000,
    ppcFeeCents: 15000,
    avgJobValueLow: 800,
    avgJobValueHigh: 5000,
    isAnchor: true,
    isSeasonal: false,
    headline: 'Licensed Utah Electricians, Matched in Minutes',
    subheadline:
      'Panel upgrades, EV chargers, remodels, and repairs — one vetted, DOPL-licensed electrician reaches out. Your info is never sold to a list.',
    description:
      'From panel upgrades in Sandy to EV charger installs in Lehi, HiveQuote matches your electrical project with one licensed, insured Utah electrician — not four competing strangers blowing up your phone.',
    projectTypes: [
      'Panel upgrade / replacement',
      'EV charger installation',
      'Remodel or addition wiring',
      'Lighting installation',
      'Troubleshooting / repair',
      'Whole-home rewire',
    ],
    faqs: [
      {
        q: 'Are your electricians licensed?',
        a: 'Yes. Every electrician on HiveQuote is verified against the Utah DOPL license database before receiving a single lead, and re-verified monthly.',
      },
      {
        q: 'How fast will someone contact me?',
        a: 'Most homeowners hear from their matched electrician within 2 business hours of submitting a request.',
      },
      {
        q: 'Does this cost me anything?',
        a: 'No. HiveQuote is free for homeowners. Contractors pay us for the introduction — you pay nothing.',
      },
    ],
  },
  {
    slug: 'plumber',
    name: 'Plumber',
    shortName: 'Plumbing',
    subBrand: 'HiveQuote Plumbing',
    icon: '🔧',
    pplPriceCents: 5000,
    ppcFeeCents: 12500,
    avgJobValueLow: 500,
    avgJobValueHigh: 4000,
    isAnchor: true,
    isSeasonal: false,
    headline: 'Vetted Utah Plumbers Without the Runaround',
    subheadline:
      'Water heaters, drains, remodels, and repairs — matched with one licensed Utah plumber who actually answers.',
    description:
      'Water heater out in January? Remodeling a bathroom in Provo? HiveQuote routes your request to one licensed, insured Utah plumber with verified capacity to take your job this month.',
    projectTypes: [
      'Water heater replacement',
      'Drain cleaning / repair',
      'Bathroom or kitchen remodel plumbing',
      'Leak detection / repair',
      'Repipe',
      'Fixture installation',
    ],
    faqs: [
      {
        q: 'Are your plumbers licensed and insured?',
        a: 'Yes. Utah DOPL license verification and current insurance certificates are required before any plumber receives leads.',
      },
      {
        q: 'Will multiple plumbers call me?',
        a: 'No. Exclusive matching is the whole point of HiveQuote — one plumber, one conversation.',
      },
      {
        q: 'What if the plumber never contacts me?',
        a: 'We follow up automatically within 24 hours. If contact fails, we rematch you with a backup pro at no cost.',
      },
    ],
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    shortName: 'Flooring',
    subBrand: 'HiveQuote Flooring',
    icon: '🪵',
    pplPriceCents: 10000,
    ppcFeeCents: 30000,
    avgJobValueLow: 2000,
    avgJobValueHigh: 15000,
    isAnchor: true,
    isSeasonal: false,
    headline: 'Hardwood, LVP & Tile Installers Utah Homeowners Trust',
    subheadline:
      'Get matched with one experienced Utah flooring installer — with real reviews, real capacity, and a real quote.',
    description:
      'Whether it is LVP through the whole main floor or tile in two bathrooms, HiveQuote matches your flooring project with one proven Utah installer selected for your area and job type.',
    projectTypes: [
      'Luxury vinyl plank (LVP)',
      'Hardwood installation / refinish',
      'Tile installation',
      'Carpet replacement',
      'Laminate',
      'Whole-home flooring',
    ],
    faqs: [
      {
        q: 'Do you handle small jobs?',
        a: 'Yes — from a single room to a whole home. Tell us the scope and we match accordingly.',
      },
      {
        q: 'Can I see the installer’s past work?',
        a: 'Every HiveQuote contractor profile shows verified Google reviews and photos of completed Utah projects.',
      },
      {
        q: 'Is my request shared with multiple companies?',
        a: 'Never. One installer gets your project, exclusively.',
      },
    ],
  },
  {
    slug: 'cabinet-install',
    name: 'Cabinet Supply & Install',
    shortName: 'Cabinets',
    subBrand: 'HiveQuote Cabinets',
    icon: '🗄️',
    pplPriceCents: 22500,
    ppcFeeCents: 50000,
    avgJobValueLow: 5000,
    avgJobValueHigh: 30000,
    isAnchor: true,
    isSeasonal: false,
    headline: 'Custom Cabinets, Supplied and Installed by Utah Pros',
    subheadline:
      'Kitchen and bath cabinet projects matched with one vetted Utah cabinet supplier-installer. No showroom pressure, no shared leads.',
    description:
      'Kitchens, baths, built-ins, and garages — HiveQuote connects your cabinet project with one established Utah cabinet company that supplies and installs, so nothing gets lost between vendors.',
    projectTypes: [
      'Full kitchen cabinets',
      'Bathroom vanities',
      'Cabinet refacing',
      'Built-ins / entertainment centers',
      'Garage cabinets',
      'Closet systems',
    ],
    faqs: [
      {
        q: 'Do your pros supply the cabinets too?',
        a: 'Yes. We prioritize supplier-installers so one company owns your project end to end.',
      },
      {
        q: 'What is a typical budget?',
        a: 'Utah kitchen cabinet projects typically run $5,000–$30,000 depending on size and materials. Your matched pro provides an exact quote.',
      },
      {
        q: 'How long does matching take?',
        a: 'Usually under 2 hours during business hours.',
      },
    ],
  },
  {
    slug: 'epoxy-residential',
    name: 'Epoxy Floor Coating (Residential)',
    shortName: 'Epoxy (Home)',
    subBrand: 'HiveQuote Epoxy',
    icon: '✨',
    pplPriceCents: 7500,
    ppcFeeCents: 20000,
    avgJobValueLow: 1500,
    avgJobValueHigh: 4000,
    isAnchor: false,
    isSeasonal: true,
    headline: 'Garage Floors That Look Like Showrooms',
    subheadline:
      'Matched with one certified Utah epoxy and polyaspartic installer. Flake, metallic, or solid — done right, guaranteed.',
    description:
      'Utah garages take a beating from snow, salt, and heat. HiveQuote matches you with one certified epoxy/polyaspartic installer whose prep process (diamond grinding, moisture testing) is verified before they join the network.',
    projectTypes: [
      'Garage floor (2-car)',
      'Garage floor (3+ car)',
      'Basement floor',
      'Patio coating',
      'Flake system',
      'Metallic epoxy',
    ],
    faqs: [
      {
        q: 'Epoxy or polyaspartic — which is right for Utah?',
        a: 'Most Utah garages do best with a hybrid: epoxy base coat, polyaspartic top coat. Your matched installer will recommend based on your slab and usage.',
      },
      {
        q: 'How long does installation take?',
        a: 'Most residential garage floors are done in 1–2 days, with 24-hour walk-on cure.',
      },
      {
        q: 'When is the best time to book?',
        a: 'April–October is peak season. Winter installs are possible for heated garages — and often come with off-season pricing.',
      },
    ],
  },
  {
    slug: 'epoxy-commercial',
    name: 'Epoxy Floor Coating (Commercial)',
    shortName: 'Epoxy (Commercial)',
    subBrand: 'HiveQuote Epoxy',
    icon: '🏭',
    pplPriceCents: 22500,
    ppcFeeCents: 50000,
    avgJobValueLow: 5000,
    avgJobValueHigh: 25000,
    isAnchor: false,
    isSeasonal: false,
    headline: 'Commercial-Grade Floor Coatings for Utah Facilities',
    subheadline:
      'Warehouses, shops, kitchens, and showrooms — matched with one commercial epoxy contractor with verified large-format experience.',
    description:
      'Commercial coating failures are expensive. HiveQuote matches your facility with one Utah contractor whose commercial portfolio, prep equipment, and insurance limits are verified for jobs of your scale.',
    projectTypes: [
      'Warehouse floor',
      'Auto shop / service bay',
      'Commercial kitchen',
      'Retail / showroom',
      'Aircraft hangar',
      'Food-grade / USDA coating',
    ],
    faqs: [
      {
        q: 'Can work happen outside business hours?',
        a: 'Yes — most commercial installers in our network schedule nights and weekends to avoid downtime.',
      },
      {
        q: 'What size jobs do you handle?',
        a: 'From 1,000 sq ft shops to 100,000+ sq ft warehouses.',
      },
      {
        q: 'Do installers carry commercial insurance?',
        a: 'Yes — commercial general liability certificates are collected and verified before matching.',
      },
    ],
  },
  {
    slug: 'concrete-coating',
    name: 'Concrete Coating',
    shortName: 'Concrete',
    subBrand: 'HiveQuote Concrete',
    icon: '🧱',
    pplPriceCents: 7500,
    ppcFeeCents: 20000,
    avgJobValueLow: 1200,
    avgJobValueHigh: 6000,
    isAnchor: false,
    isSeasonal: true,
    headline: 'Driveways & Patios Sealed Against Utah Winters',
    subheadline:
      'One vetted Utah concrete coating pro for your driveway, patio, or walkway. Salt-proof, UV-stable, guaranteed.',
    description:
      'Freeze-thaw cycles and road salt destroy unprotected concrete along the Wasatch Front. HiveQuote matches you with one coating specialist who preps and seals it to survive Utah winters.',
    projectTypes: [
      'Driveway coating / sealing',
      'Patio coating',
      'Pool deck',
      'Walkways / steps',
      'Stamped overlay',
      'Repair + coat',
    ],
    faqs: [
      {
        q: 'When can coating be applied?',
        a: 'Outdoor coatings need temperatures above ~50°F — typically April through October in northern Utah.',
      },
      {
        q: 'How long does it last?',
        a: 'Quality polyaspartic and penetrating sealers last 5–15+ years depending on system. Your pro will explain warranty terms.',
      },
      {
        q: 'Is this free for homeowners?',
        a: 'Completely. Contractors pay for introductions; you never pay HiveQuote.',
      },
    ],
  },
  {
    slug: 'excavation',
    name: 'Excavation',
    shortName: 'Excavation',
    subBrand: 'HiveQuote Excavation',
    icon: '🚜',
    pplPriceCents: 17500,
    ppcFeeCents: 40000,
    avgJobValueLow: 3000,
    avgJobValueHigh: 20000,
    isAnchor: false,
    isSeasonal: true,
    headline: 'Licensed Utah Excavators for Grading, Utilities & Pads',
    subheadline:
      'Residential grading, utility trenching, and building pads — matched with one licensed, insured Utah excavation contractor.',
    description:
      'Excavation mistakes are buried — until they cost you. HiveQuote matches your dirt work with one licensed Utah excavator with the right equipment class and Blue Stakes compliance for your project.',
    projectTypes: [
      'Lot grading / leveling',
      'Utility trenching',
      'Foundation / basement dig',
      'Building pad prep',
      'Driveway cut',
      'Demolition + haul-off',
    ],
    faqs: [
      {
        q: 'Do your excavators handle Blue Stakes?',
        a: 'Yes — all network excavators locate utilities via Blue Stakes of Utah (811) before any dig.',
      },
      {
        q: 'What season is best?',
        a: 'April–October for most work. Frozen ground pauses most residential excavation November–March.',
      },
      {
        q: 'Are they licensed?',
        a: 'Yes — DOPL contractor licenses verified before matching and re-verified monthly.',
      },
    ],
  },
  {
    slug: 'framing',
    name: 'Framing',
    shortName: 'Framing',
    subBrand: 'HiveQuote Framing',
    icon: '🏗️',
    pplPriceCents: 30000,
    ppcFeeCents: 80000,
    avgJobValueLow: 10000,
    avgJobValueHigh: 60000,
    isAnchor: false,
    isSeasonal: false,
    headline: 'Framing Crews for Utah Additions, ADUs & Garages',
    subheadline:
      'Building an ADU in Salt Lake or an addition in Draper? Get matched with one licensed Utah framing contractor with verified crew capacity.',
    description:
      'Utah’s ADU boom means good framers are booked out. HiveQuote matches your addition, ADU, or garage build with one licensed framing contractor whose current capacity is verified — not a voicemail box.',
    projectTypes: [
      'ADU (accessory dwelling unit)',
      'Home addition',
      'Detached garage / shop',
      'Basement framing',
      'Deck framing',
      'Structural repair',
    ],
    faqs: [
      {
        q: 'Do framers pull permits?',
        a: 'Framing typically falls under your general permit; your matched contractor will confirm scope and permitting responsibilities up front.',
      },
      {
        q: 'What do ADU builds cost in Utah?',
        a: 'Framing packages for ADUs commonly run $10,000–$60,000 depending on size and complexity. Your pro provides a line-item bid.',
      },
      {
        q: 'Are crews insured?',
        a: 'General liability and workers comp certificates are verified before any crew receives a lead.',
      },
    ],
  },
  {
    slug: 'sports-courts',
    name: 'Sports Courts (New Construction)',
    shortName: 'Sport Courts',
    subBrand: 'HiveQuote Courts',
    icon: '🏀',
    pplPriceCents: 37500,
    ppcFeeCents: 100000,
    avgJobValueLow: 15000,
    avgJobValueHigh: 60000,
    isAnchor: false,
    isSeasonal: false,
    headline: 'Backyard Courts Built by Utah Court Specialists',
    subheadline:
      'Pickleball, basketball, and multi-sport courts — matched with one Utah builder who does courts, not just concrete.',
    description:
      'A backyard court is a $15,000–$60,000 investment in concrete, surfacing, and drainage that most GCs get wrong. HiveQuote matches you with one Utah contractor who specializes in court construction.',
    projectTypes: [
      'Pickleball court (new)',
      'Basketball court',
      'Multi-sport court',
      'Sport tile system',
      'Court lighting',
      'Fencing + accessories',
    ],
    faqs: [
      {
        q: 'How much does a backyard pickleball court cost in Utah?',
        a: 'A regulation 30×60 court typically runs $25,000–$45,000 including concrete, surfacing, and net posts. Smaller footprints cost less.',
      },
      {
        q: 'How long does construction take?',
        a: 'Roughly 2–4 weeks including concrete cure time before surfacing.',
      },
      {
        q: 'Do you handle HOA projects?',
        a: 'Yes — our court builders regularly work with HOAs and municipalities.',
      },
    ],
  },
  {
    slug: 'pickleball-resurfacing',
    name: 'Pickleball Court Resurfacing',
    shortName: 'Pickleball',
    subBrand: 'HiveQuote Courts',
    icon: '🏓',
    pplPriceCents: 10000,
    ppcFeeCents: 30000,
    avgJobValueLow: 2500,
    avgJobValueHigh: 8000,
    isAnchor: false,
    isSeasonal: true,
    headline: 'Utah Pickleball Court Resurfacing, Done Right',
    subheadline:
      'Cracks, fading, dead spots — matched with one Utah court resurfacing specialist. Homes, HOAs, and clubs.',
    description:
      'Utah is the pickleball capital of America, and its courts crack fast in freeze-thaw country. HiveQuote matches your resurfacing project with one specialist using acrylic systems built for Utah’s climate.',
    projectTypes: [
      'Full resurface (acrylic system)',
      'Crack repair + resurface',
      'Line striping / conversion',
      'HOA / community courts',
      'Club / commercial courts',
      'Color change',
    ],
    faqs: [
      {
        q: 'How much does resurfacing cost in Utah?',
        a: 'Typical single-court resurfacing runs $2,500–$8,000 depending on crack repair scope and coating system.',
      },
      {
        q: 'How often should courts be resurfaced?',
        a: 'Every 4–7 years in Utah’s climate, sooner with heavy use or standing water.',
      },
      {
        q: 'What season can this be done?',
        a: 'Acrylic coatings need warm, dry weather — April through October along the Wasatch Front.',
      },
    ],
  },
]

export function getTrade(slug: string): Trade | undefined {
  return TRADES.find((t) => t.slug === slug)
}

export const ANCHOR_TRADES = TRADES.filter((t) => t.isAnchor)
export const UTAH_CITIES = [
  'Salt Lake City',
  'Provo',
  'Orem',
  'Lehi',
  'Sandy',
  'Draper',
  'West Jordan',
  'South Jordan',
  'Murray',
  'West Valley City',
  'Ogden',
  'Layton',
  'Herriman',
  'Eagle Mountain',
  'Saratoga Springs',
  'St. George',
]

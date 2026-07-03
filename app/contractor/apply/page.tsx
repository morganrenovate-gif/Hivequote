import ContractorOnboardingForm from '@/components/ContractorOnboardingForm'

export const metadata = {
  title: 'Apply to Join — Exclusive Utah Leads for Contractors',
  description:
    'Apply to join the HiveQuote contractor network. Exclusive leads, transparent pricing, DOPL-verified network.',
}

export default function ApplyPage() {
  return (
    <section className="bg-hive-50 py-16">
      <div className="container-site grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="eyebrow mb-3">Contractor Application</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
            Join the hive
          </h1>
          <p className="mt-4 leading-relaxed text-hive-600">
            Five minutes now, exclusive leads within days. Here&apos;s what we
            need and why:
          </p>
          <ul className="mt-6 space-y-4 text-sm text-hive-700">
            <li className="flex gap-3">
              <Badge>1</Badge>
              <span><strong>License number.</strong> We verify every licensed trade against Utah DOPL — it&apos;s what makes a HiveQuote match worth more than a directory listing.</span>
            </li>
            <li className="flex gap-3">
              <Badge>2</Badge>
              <span><strong>Service area.</strong> Leads route by ZIP, so you only ever pay for homeowners you can actually reach.</span>
            </li>
            <li className="flex gap-3">
              <Badge>3</Badge>
              <span><strong>Real capacity.</strong> If you&apos;re booked solid, we&apos;ll waitlist you instead of selling you leads you can&apos;t answer. That policy protects everyone&apos;s reviews.</span>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <ContractorOnboardingForm />
        </div>
      </div>
    </section>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hive-950 text-xs font-bold text-honey-400">
      {children}
    </span>
  )
}

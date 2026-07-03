import { mockContractors } from '@/lib/mock/store'
import ContractorCard from '@/components/ContractorCard'

export const metadata = {
  title: 'Utah Contractor Directory — Vetted, Licensed, Reviewed',
  description:
    'Browse HiveQuote’s network of vetted Utah contractors. Every pro is DOPL license-verified with insurance on file.',
}

export default function DirectoryPage() {
  const active = mockContractors.filter((c) => c.status === 'active')

  return (
    <>
      <section className="bg-hive-950 py-16 text-white">
        <div className="container-site max-w-3xl">
          <p className="eyebrow mb-4">The Network</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Vetted Utah contractors
          </h1>
          <p className="mt-4 text-lg text-hive-300">
            Every contractor below passed DOPL license verification, carries
            current insurance, and maintains a response-rate standard to stay
            in the hive.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-site">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c) => (
              <ContractorCard key={c.id} contractor={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

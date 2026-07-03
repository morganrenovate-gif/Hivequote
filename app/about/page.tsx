import Link from 'next/link'

export const metadata = {
  title: 'About HiveQuote — Built in Utah, for Utah',
  description:
    'HiveQuote is a Utah-based home services lead exchange connecting homeowners with one vetted, licensed contractor per project.',
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-hive-950 py-20 text-white">
        <div className="container-site max-w-3xl">
          <p className="eyebrow mb-4">Our Story</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Built in Utah, for Utah
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container-site max-w-3xl space-y-6 text-lg leading-relaxed text-hive-700">
          <p>
            HiveQuote started with a simple observation from inside Utah&apos;s
            contractor community: the national lead platforms treat both sides
            badly. Homeowners get their phone numbers sold to four competing
            strangers. Contractors pay premium prices for those same shared
            leads and win a fraction of them. Everybody loses except the
            platform.
          </p>
          <p>
            We built HiveQuote around one rule that changes everything:
            <strong className="text-hive-950"> every lead is exclusive.</strong>{' '}
            One homeowner project goes to one vetted contractor. The homeowner
            has a single conversation with a pro who actually wants the job.
            The contractor gets a lead they don&apos;t have to race three
            competitors to answer.
          </p>
          <p>
            Vetting is the other half. Every contractor in the hive is verified
            against Utah&apos;s DOPL license database before receiving a single
            lead — and re-verified every month. Insurance certificates are
            collected and kept current. Contractors who don&apos;t respond to
            homeowners, or who generate complaints, lose access.
          </p>
          <p>
            We&apos;re a Utah company serving the Wasatch Front and expanding
            statewide. No call centers, no venture-scale spam machine — just a
            better market for the people who live and build here.
          </p>
        </div>
      </section>

      <section className="bg-honey-50 py-14">
        <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-hive-950">
              Homeowner or contractor, the hive works for you.
            </h2>
          </div>
          <div className="flex gap-3">
            <Link href="/#services" className="btn-dark">Get Matched</Link>
            <Link href="/for-contractors" className="btn-ghost">Join as a Pro</Link>
          </div>
        </div>
      </section>
    </>
  )
}

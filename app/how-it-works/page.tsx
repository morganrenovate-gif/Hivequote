import Link from 'next/link'

export const metadata = {
  title: 'How It Works — One Project, One Vetted Utah Pro',
  description:
    'How HiveQuote matches Utah homeowners with exactly one licensed, insured contractor per project. Free for homeowners, exclusive for pros.',
}

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-hive-950 py-20 text-white">
        <div className="container-site max-w-3xl">
          <p className="eyebrow mb-4">For Homeowners</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            How HiveQuote works
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-hive-300">
            The national lead sites auction your phone number to four or more
            contractors the second you hit submit. We built HiveQuote to do
            the opposite: one project, one vetted Utah pro, one conversation.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-site max-w-3xl space-y-14">
          {[
            {
              n: '01',
              title: 'You tell us about your project',
              body: 'Pick your service, answer a 60-second set of questions — project type, timeline, ZIP code — and confirm how you want to be contacted. That consent step matters: it means only HiveQuote and your one matched pro can contact you. Nobody else. Ever.',
            },
            {
              n: '02',
              title: 'We verify intent and match one pro',
              body: 'We confirm your timeline by text, then our routing engine selects the single best contractor for your trade and area — factoring in license status, insurance, current capacity, and review history. Every pro is verified against the Utah DOPL license database before joining, and re-verified monthly.',
            },
            {
              n: '03',
              title: 'Your pro reaches out — fast',
              body: 'Because the lead is exclusive, your matched contractor treats it like gold. Most homeowners hear back within 2 business hours. You get their name and company up front, so you know exactly who is calling.',
            },
            {
              n: '04',
              title: 'We make sure it actually happened',
              body: 'Twenty-four hours later, we check in: did they reach you? If not, we escalate and rematch you with a backup pro automatically. After the project, we ask how it went — contractors who underperform lose access to the network.',
            },
          ].map((s) => (
            <div key={s.n} className="flex gap-6">
              <span className="text-3xl font-extrabold text-honey-500">{s.n}</span>
              <div>
                <h2 className="text-xl font-bold text-hive-950">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-hive-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-hive-50 py-16">
        <div className="container-site max-w-3xl">
          <h2 className="text-2xl font-extrabold text-hive-950">
            What it costs you: nothing
          </h2>
          <p className="mt-3 leading-relaxed text-hive-600">
            HiveQuote is 100% free for homeowners. Contractors pay us for
            qualified introductions — that&apos;s our whole business. You never
            pay HiveQuote a cent, and your matched contractor&apos;s quote is
            between you and them.
          </p>
          <div className="mt-8">
            <Link href="/#services" className="btn-primary">
              Start Your Project
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

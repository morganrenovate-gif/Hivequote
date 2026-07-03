export const metadata = {
  title: 'Privacy Policy',
  description: 'HiveQuote privacy policy — UCPA-aligned data practices for Utah consumers.',
}

export default function PrivacyPage() {
  return (
    <section className="py-16">
      <div className="container-site max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-hive-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-hive-500">Last updated: July 2026</p>

        <div className="prose-hive mt-8 space-y-8 text-hive-700">
          <div>
            <h2 className="text-xl font-bold text-hive-950">Who we are</h2>
            <p className="mt-2 leading-relaxed">
              HiveQuote LLC (&quot;HiveQuote,&quot; &quot;we,&quot; &quot;us&quot;) operates a Utah home
              services lead exchange that connects homeowners with independent,
              licensed contractors. This policy describes how we collect, use,
              and share personal information, consistent with the Utah Consumer
              Privacy Act (UCPA).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">What we collect</h2>
            <p className="mt-2 leading-relaxed">
              When you request a project match, we collect: name, phone number,
              email address, project address or ZIP code, project details,
              timeline, and how you heard about us. We also log your IP
              address, the form URL, and the exact consent language you agreed
              to at the time of submission. If you are a contractor, we
              additionally collect business, licensing, insurance, and payment
              information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">How we use it</h2>
            <p className="mt-2 leading-relaxed">
              We use homeowner information for exactly one commercial purpose:
              matching your project with one vetted contractor and managing
              that introduction (confirmations, follow-ups, and satisfaction
              checks). Your matched contractor receives your name, contact
              information, and project details so they can reach you. We do not
              sell your contact information to lead lists, and we do not share
              your project with multiple competing contractors.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">Text messages and calls</h2>
            <p className="mt-2 leading-relaxed">
              With your express consent at form submission, HiveQuote and your
              single matched contractor may contact you by automated text
              message and phone about your project request. Consent is not a
              condition of purchase. Message and data rates may apply. Reply
              STOP to any message to opt out immediately — opt-outs are honored
              across our entire platform and logged permanently.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">Aggregated data</h2>
            <p className="mt-2 leading-relaxed">
              We may produce anonymized, aggregated market statistics (for
              example, average project values by city). Aggregated data never
              identifies you and cannot reasonably be re-linked to you.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">Your rights under the UCPA</h2>
            <p className="mt-2 leading-relaxed">
              Utah residents may request access to or deletion of the personal
              data we hold, and may opt out of targeted advertising and any
              sale of personal data. To exercise these rights, email
              privacy@hivequote.com. We respond within 45 days.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">Data retention and security</h2>
            <p className="mt-2 leading-relaxed">
              Lead and consent records are retained for a minimum of four years
              to satisfy telemarketing compliance requirements, then deleted or
              anonymized. Data is stored with encryption at rest and in
              transit, with access restricted by role.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-hive-950">Contact</h2>
            <p className="mt-2 leading-relaxed">
              HiveQuote LLC · Salt Lake City, Utah ·
              privacy@hivequote.com
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

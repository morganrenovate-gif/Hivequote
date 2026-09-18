import Link from 'next/link'
import HedyMigrationGate from '@/components/HedyMigrationGate'

export default function ContractorLoginPage() {
  return (
    <>
      <HedyMigrationGate
        area="Contractor login"
        detail="Contractor authentication is moving to Hedy and has not been activated yet. The previous Supabase password flow and demo any-credentials fallback are disabled."
      />
      <div className="container-site -mt-10 pb-16 text-center text-sm">
        <Link href="/for-contractors" className="font-semibold text-honey-600 hover:text-honey-700">
          Contractor program details
        </Link>
      </div>
    </>
  )
}

import HedyMigrationGate from '@/components/HedyMigrationGate'

export const metadata = {
  title: 'Contractor Directory',
  description: 'HiveQuote contractor directory.',
}

export default function DirectoryPage() {
  return (
    <HedyMigrationGate
      area="Contractor directory"
      detail="The public directory is not showing demo contractors. Verified contractor profiles will be published only after the Hedy contractor registry is activated."
    />
  )
}

import HedyMigrationGate from '@/components/HedyMigrationGate'
export default function AdminPaymentsPage() {
  return <HedyMigrationGate area="Payments" detail="Payment and ledger views are disabled until authenticated Hedy ledger access and Stripe reconciliation are separately approved and activated." />
}

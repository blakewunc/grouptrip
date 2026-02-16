import { redirect } from 'next/navigation'

export default async function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  redirect(`/trips/${tripId}?tab=budget`)
}

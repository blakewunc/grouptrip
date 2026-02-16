import { redirect } from 'next/navigation'

export default async function SuppliesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  redirect(`/trips/${tripId}?tab=supplies`)
}

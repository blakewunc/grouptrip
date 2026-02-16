import { redirect } from 'next/navigation'

export default async function ItineraryPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  redirect(`/trips/${tripId}?tab=itinerary`)
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F5F1ED] to-[#E8E3DD] px-4">
      <main className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#252323] sm:text-6xl">
          GroupTrip
        </h1>
        <p className="mb-8 text-xl text-[#A99985]">
          Plan unforgettable group adventures with ease
        </p>
        <p className="mb-12 text-lg text-[#70798C]">
          Collaborate on itineraries, split costs fairly, and keep everyone on the same page.
          Perfect for bachelor parties, golf trips, and group getaways.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-[5px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="mb-3 text-3xl">📅</div>
            <h3 className="mb-2 font-semibold text-[#252323]">
              Shared Itineraries
            </h3>
            <p className="text-sm text-[#A99985]">
              Build day-by-day plans together with real-time collaboration
            </p>
          </div>
          <div className="rounded-[5px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="mb-3 text-3xl">💰</div>
            <h3 className="mb-2 font-semibold text-[#252323]">
              Budget Splitting
            </h3>
            <p className="text-sm text-[#A99985]">
              Transparent cost breakdown with automatic per-person calculations
            </p>
          </div>
          <div className="rounded-[5px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="mb-3 text-3xl">🔗</div>
            <h3 className="mb-2 font-semibold text-[#252323]">
              Shareable Links
            </h3>
            <p className="text-sm text-[#A99985]">
              Invite friends with a simple link—no app download required
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

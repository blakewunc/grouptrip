import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#DAD2BC] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z" />
              </svg>
              <span className="text-lg font-bold text-[#252323]">GroupTrip</span>
            </div>
            <p className="mt-2 text-sm text-[#A99985]">
              Collaborative trip planning for groups. Itineraries, budgets, and expenses — all in one place.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#252323]">Product</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/trips" className="text-sm text-[#A99985] transition-colors hover:text-[#252323]">
                    My Trips
                  </Link>
                </li>
                <li>
                  <Link href="/trips/new" className="text-sm text-[#A99985] transition-colors hover:text-[#252323]">
                    Create Trip
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-sm text-[#A99985] transition-colors hover:text-[#252323]">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#252323]">Legal</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-[#A99985] transition-colors hover:text-[#252323]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-[#A99985] transition-colors hover:text-[#252323]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-[#F5F1ED] pt-6">
          <p className="text-xs text-[#A99985]">
            &copy; {new Date().getFullYear()} GroupTrip. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-[#DAD2BC] bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <svg className="h-8 w-8 text-[#70798C]" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-2-20v12l10 6-10-18z"/>
            </svg>
            <span className="text-xl font-bold text-[#252323]">
              GroupTrip
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {user && (
              <div className="hidden items-center space-x-6 md:flex">
                <Link
                  href="/trips"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/trips')
                      ? 'text-[#252323]'
                      : 'text-[#A99985] hover:text-[#252323]'
                  }`}
                >
                  My Trips
                </Link>
                <Link
                  href="/trips/new"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/trips/new')
                      ? 'text-[#252323]'
                      : 'text-[#A99985] hover:text-[#252323]'
                  }`}
                >
                  Create Trip
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className="hidden text-sm text-[#A99985] sm:block">
                    {user.email}
                  </span>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm">
                      Settings
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation (only show when authenticated) */}
      {user && (
        <div className="border-t border-[#DAD2BC] md:hidden">
          <div className="space-y-1 px-6 py-4">
            <Link
              href="/trips"
              className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive('/trips')
                  ? 'bg-[#F5F1ED] text-[#252323]'
                  : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
              }`}
            >
              My Trips
            </Link>
            <Link
              href="/trips/new"
              className={`block rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive('/trips/new')
                  ? 'bg-[#F5F1ED] text-[#252323]'
                  : 'text-[#A99985] hover:bg-[#F5F1ED] hover:text-[#252323]'
              }`}
            >
              Create Trip
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

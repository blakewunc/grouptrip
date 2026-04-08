import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin flag via service client (bypasses RLS)
  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="border-b border-[#DAD2BC] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-[#252323]">Admin</span>
            <Link
              href="/admin/blog"
              className="text-sm text-[#70798C] hover:text-[#252323]"
            >
              Blog posts
            </Link>
          </div>
          <Link href="/trips" className="text-xs text-[#A99985] hover:text-[#252323]">
            ← Back to app
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  )
}

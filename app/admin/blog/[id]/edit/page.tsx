import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogPostForm } from '@/components/admin/BlogPostForm'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) notFound()

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="mb-2 inline-block text-xs text-[#A99985] hover:text-[#252323]"
        >
          ← All posts
        </Link>
        <h1 className="text-2xl font-bold text-[#252323]">Edit post</h1>
      </div>
      <BlogPostForm initial={{ ...post, id }} />
    </div>
  )
}

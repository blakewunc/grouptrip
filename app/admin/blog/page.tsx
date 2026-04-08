import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminBlogPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, category, published, author, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#252323]">Blog posts</h1>
          {!error && (
            <p className="mt-1 text-sm text-[#A99985]">
              {posts?.length ?? 0} post{posts?.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-[5px] bg-[#252323] px-4 py-2 text-sm font-semibold text-white hover:bg-[#70798C]"
        >
          New post
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600">Failed to load posts: {error.message}</p>
      )}

      {posts && posts.length === 0 && (
        <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-12 text-center">
          <p className="text-sm text-[#A99985]">No posts yet.</p>
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-block text-sm font-semibold text-[#70798C] underline-offset-2 hover:underline"
          >
            Write your first post
          </Link>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="overflow-hidden rounded-[5px] border border-[#DAD2BC] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DAD2BC] bg-[#F5F1ED]">
                <th className="px-4 py-3 text-left font-semibold text-[#252323]">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-[#252323]">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-[#252323]">Author</th>
                <th className="px-4 py-3 text-left font-semibold text-[#252323]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#252323]">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAD2BC]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#F5F1ED]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#252323]">{post.title}</p>
                    <p className="text-xs text-[#A99985]">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[#70798C]">{post.category || '—'}</td>
                  <td className="px-4 py-3 text-[#70798C]">{post.author || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-[5px] px-2 py-0.5 text-xs font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#F5F1ED] text-[#A99985]'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#A99985]">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-xs font-semibold text-[#70798C] hover:text-[#252323]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

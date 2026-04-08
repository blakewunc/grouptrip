import Link from 'next/link'
import { BlogPostForm } from '@/components/admin/BlogPostForm'

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="mb-2 inline-block text-xs text-[#A99985] hover:text-[#252323]"
        >
          ← All posts
        </Link>
        <h1 className="text-2xl font-bold text-[#252323]">New post</h1>
      </div>
      <BlogPostForm />
    </div>
  )
}

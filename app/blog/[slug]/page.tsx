import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { BlogCTA } from '@/components/BlogCTA'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} | The Starter`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      siteName: 'The Starter',
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Back */}
        <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-[#A99985] transition-colors hover:text-[#252323]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Guides
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A7C59]">
              {post.category}
            </span>
            <span className="text-xs text-[#A99985]">{post.readTime}</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-[#252323] sm:text-4xl">
            {post.title}
          </h1>
          <p className="text-base leading-relaxed text-[#A99985]">{post.description}</p>
          <p className="mt-4 text-xs text-[#A99985]">
            {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-stone max-w-none
          prose-headings:font-semibold prose-headings:text-[#252323] prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#DAD2BC] prose-h2:pb-2
          prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#252323] prose-p:leading-7
          prose-li:text-[#252323] prose-li:leading-relaxed
          prose-ul:my-4 prose-ol:my-4
          prose-strong:text-[#252323] prose-strong:font-semibold
          prose-a:text-[#4A7C59] prose-a:no-underline hover:prose-a:underline
          prose-hr:border-[#DAD2BC] prose-hr:my-10
          prose-blockquote:border-l-[#70798C] prose-blockquote:text-[#A99985] prose-blockquote:not-italic
          prose-table:text-sm prose-th:text-[#252323] prose-td:text-[#252323]
          prose-code:text-[#252323] prose-code:bg-[#F5F1ED] prose-code:px-1 prose-code:rounded
        ">
          <MDXRemote source={post.content} />
        </div>

        <BlogCTA />
      </div>
    </div>
  )
}

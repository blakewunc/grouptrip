import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// GET /api/admin/blog — list all posts
export async function GET() {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts })
}

// POST /api/admin/blog — create a post
export async function POST(request: Request) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, slug, category, excerpt, content, meta_title, meta_description, focus_keyword, published, featured_image_url, author } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert({
      title: title.trim(),
      slug: slug.trim(),
      category: category?.trim() || null,
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || null,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null,
      focus_keyword: focus_keyword?.trim() || null,
      published: published ?? false,
      featured_image_url: featured_image_url?.trim() || null,
      author: author?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post }, { status: 201 })
}

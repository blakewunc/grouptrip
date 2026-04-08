import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// PUT /api/admin/blog/[id] — update a post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, slug, category, excerpt, content, meta_title, meta_description, focus_keyword, published, featured_image_url, author } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({
      title: title.trim(),
      slug: slug?.trim(),
      category: category?.trim() || null,
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || null,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null,
      focus_keyword: focus_keyword?.trim() || null,
      published: published ?? false,
      featured_image_url: featured_image_url?.trim() || null,
      author: author?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post })
}

// DELETE /api/admin/blog/[id] — delete a post
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/trips/[tripId]/documents/[documentId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; documentId: string }> }
) {
  try {
    const { tripId, documentId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a member and owns this document
    const { data: document } = await supabase
      .from('trip_documents')
      .select('created_by')
      .eq('id', documentId)
      .eq('trip_id', tripId)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.created_by !== user.id) {
      return NextResponse.json({ error: 'Can only delete your own documents' }, { status: 403 })
    }

    const { error } = await supabase
      .from('trip_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Document deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    )
  }
}

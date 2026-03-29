import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const CreateSchema = z.object({
  contactId: z.string().uuid(),
  type: z.enum(['job_completed', 'call', 'message', 'quote', 'review_request', 'email', 'visit', 'other']),
  notes: z.string().optional(),
  jobValue: z.number().min(0).optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { contactId, type, notes, jobValue } = parsed.data

  // Verify contact belongs to user
  const { data: contact } = await supabase.from('contacts').select('id, total_jobs, total_revenue').eq('id', contactId).eq('user_id', user.id).single()
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  // Insert interaction
  const { data: interaction, error } = await supabase.from('interactions').insert({
    contact_id: contactId,
    user_id: user.id,
    type,
    notes: notes || null,
    job_value: jobValue ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to log interaction' }, { status: 500 })

  // Update contact stats
  const contactUpdates: Record<string, unknown> = {
    last_contact_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (type === 'job_completed' && jobValue !== undefined) {
    contactUpdates.total_jobs = (contact.total_jobs ?? 0) + 1
    contactUpdates.total_revenue = (contact.total_revenue ?? 0) + jobValue
  }

  await supabase.from('contacts').update(contactUpdates).eq('id', contactId)

  return NextResponse.json({ interaction }, { status: 201 })
}

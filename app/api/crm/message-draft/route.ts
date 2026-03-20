import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { draftContactMessage } from '@/lib/agents/crmAgent'
import type { BusinessProfile, Contact } from '@/lib/agents/types'

const Schema = z.object({
  contactId: z.string().uuid(),
  messageType: z.enum(['follow_up', 'review_request', 'win_back', 'vip_appreciation', 'seasonal']).default('follow_up'),
  businessProfileId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { contactId, messageType, businessProfileId } = parsed.data

  // Load contact
  const { data: contact } = await supabase.from('contacts').select('*').eq('id', contactId).eq('user_id', user.id).single()
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  // Load business profile
  let bp: BusinessProfile | null = null
  const bpId = businessProfileId ?? contact.business_profile_id
  if (bpId) {
    const { data } = await supabase.from('business_profiles').select('*').eq('id', bpId).eq('user_id', user.id).single()
    bp = data as BusinessProfile
  }
  if (!bp) {
    const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single()
    bp = data as BusinessProfile
  }
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  try {
    const draft = await draftContactMessage(contact as Contact, bp, messageType)
    return NextResponse.json({ draft })
  } catch (err) {
    console.error('Message draft error:', err)
    return NextResponse.json({ error: 'Failed to draft message' }, { status: 500 })
  }
}

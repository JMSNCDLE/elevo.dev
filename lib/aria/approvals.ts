import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export interface ApprovalRequest {
  id?: string
  action_type: string
  action_description: string
  risk_level: 'low' | 'medium' | 'high'
  action_payload: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'expired'
  requested_at?: string
  responded_at?: string
  executed_at?: string
  telegram_message_id?: number
}

export async function requestApproval(request: {
  action_type: string
  action_description: string
  risk_level: 'low' | 'medium' | 'high'
  action_payload: Record<string, unknown>
}): Promise<string> {
  const { data, error } = await getSupabase()
    .from('aria_approval_queue')
    .insert({
      action_type: request.action_type,
      action_description: request.action_description,
      risk_level: request.risk_level,
      action_payload: request.action_payload,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  const { data } = await getSupabase()
    .from('aria_approval_queue')
    .select('*')
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })
  return data || []
}

export async function findApprovalByPrefix(prefix: string): Promise<ApprovalRequest | null> {
  const { data } = await getSupabase()
    .from('aria_approval_queue')
    .select('*')
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })

  return data?.find(a => a.id.startsWith(prefix)) || null
}

export async function updateApprovalStatus(id: string, status: 'approved' | 'rejected') {
  await getSupabase()
    .from('aria_approval_queue')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', id)
}

export async function markExecuted(id: string) {
  await getSupabase()
    .from('aria_approval_queue')
    .update({ status: 'executed', executed_at: new Date().toISOString() })
    .eq('id', id)
}

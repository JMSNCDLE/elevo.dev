'use client'

export type ClientStage =
  | 'visitor'
  | 'trial'
  | 'trial_active'
  | 'trial_expiring'
  | 'trial_expired'
  | 'launch'
  | 'orbit'
  | 'galaxy'
  | 'churned'

export interface ClientStageInfo {
  stage: ClientStage
  label: string
  color: string
  daysInStage: number
  nextAction: string
  progressPercent: number
  shouldShowUpgradePrompt: boolean
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

export function useClientStage(profile: {
  plan?: string
  trialEndsAt?: string
  subscriptionStatus?: string
  createdAt?: string
} | null): ClientStageInfo {
  const getStageInfo = (): ClientStageInfo => {
    if (!profile) return {
      stage: 'visitor',
      label: 'Visitor',
      color: 'gray',
      daysInStage: 0,
      nextAction: 'Sign up for free trial',
      progressPercent: 5,
      shouldShowUpgradePrompt: false,
      urgencyLevel: 'none',
    }
    const now = new Date()
    const trialEnd = profile.trialEndsAt ? new Date(profile.trialEndsAt) : null
    const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000) : 0

    if (profile.plan === 'galaxy') return { stage: 'galaxy', label: 'Galaxy', color: 'purple', daysInStage: 0, nextAction: 'Explore all 35+ agents', progressPercent: 100, shouldShowUpgradePrompt: false, urgencyLevel: 'none' }
    if (profile.plan === 'orbit') return { stage: 'orbit', label: 'Orbit', color: 'indigo', daysInStage: 0, nextAction: 'Upgrade to Galaxy for CEO agent', progressPercent: 80, shouldShowUpgradePrompt: true, urgencyLevel: 'low' }
    if (profile.plan === 'launch') return { stage: 'launch', label: 'Launch', color: 'blue', daysInStage: 0, nextAction: 'Upgrade to Orbit for unlimited credits', progressPercent: 60, shouldShowUpgradePrompt: true, urgencyLevel: 'low' }
    if (trialEnd && daysLeft <= 0) return { stage: 'trial_expired', label: 'Trial expired', color: 'red', daysInStage: Math.abs(daysLeft), nextAction: 'Choose a plan to continue', progressPercent: 30, shouldShowUpgradePrompt: true, urgencyLevel: 'critical' }
    if (trialEnd && daysLeft <= 2) return { stage: 'trial_expiring', label: `Trial ends in ${daysLeft}d`, color: 'orange', daysInStage: 7 - daysLeft, nextAction: 'Upgrade now before you lose access', progressPercent: 35, shouldShowUpgradePrompt: true, urgencyLevel: 'high' }
    if (profile.plan === 'trial') return { stage: 'trial_active', label: `Trial — ${daysLeft}d left`, color: 'green', daysInStage: 7 - daysLeft, nextAction: 'Explore your AI team before trial ends', progressPercent: 25, shouldShowUpgradePrompt: false, urgencyLevel: 'none' }
    return { stage: 'trial', label: 'Trial', color: 'green', daysInStage: 0, nextAction: 'Start using your agents', progressPercent: 20, shouldShowUpgradePrompt: false, urgencyLevel: 'none' }
  }
  return getStageInfo()
}

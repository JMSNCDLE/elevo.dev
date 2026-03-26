'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, Plus, Search, Briefcase, ChevronRight, Loader2,
  DollarSign, Clock, Tag, Lock, Send,
} from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Job {
  id: string
  poster_id: string
  title: string
  description: string
  category: string
  budget_min: number | null
  budget_max: number | null
  currency: string
  deadline: string | null
  skills: string[]
  status: string
  created_at: string
}

const CATEGORIES = [
  'All', 'Design', 'Development', 'Marketing', 'Content Writing',
  'Video/Photo', 'Social Media', 'SEO', 'Translation', 'Virtual Assistant', 'Consulting',
]

const CATEGORY_COLORS: Record<string, string> = {
  Design: 'bg-pink-500', Development: 'bg-blue-500', Marketing: 'bg-green-500',
  'Content Writing': 'bg-purple-500', 'Video/Photo': 'bg-red-500',
  'Social Media': 'bg-orange-500', SEO: 'bg-cyan-500', Translation: 'bg-indigo-500',
  'Virtual Assistant': 'bg-yellow-500', Consulting: 'bg-emerald-500',
}

export default function MarketplacePage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'
  const supabase = createBrowserClient()

  const [plan, setPlan] = useState<string>('trial')
  const [userId, setUserId] = useState<string>('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [tab, setTab] = useState<'browse' | 'my-jobs' | 'post'>('browse')

  // Post job form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Design')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [skills, setSkills] = useState('')
  const [posting, setPosting] = useState(false)

  // Apply form
  const [applyingTo, setApplyingTo] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase.from('profiles').select('plan').eq('id', user.id).single().then(({ data }) => {
        setPlan(data?.plan ?? 'trial')
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab === 'my-jobs') params.set('my', 'true')
    if (activeCategory !== 'All' && tab === 'browse') params.set('category', activeCategory)
    const res = await fetch(`/api/marketplace/jobs?${params}`)
    if (res.ok) {
      const data = await res.json()
      setJobs(data.jobs ?? [])
    }
    setLoading(false)
  }, [tab, activeCategory])

  useEffect(() => { loadJobs() }, [loadJobs])

  const canPost = plan === 'orbit' || plan === 'galaxy'

  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setPosting(true)
    const res = await fetch('/api/marketplace/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(), description: description.trim(), category,
        budget_min: budgetMin ? parseInt(budgetMin) : null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      }),
    })
    if (res.ok) {
      toast.success('Job posted!')
      setTitle(''); setDescription(''); setSkills(''); setBudgetMin(''); setBudgetMax('')
      setTab('my-jobs')
      loadJobs()
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Failed to post job')
    }
    setPosting(false)
  }

  async function handleApply(jobId: string) {
    if (!coverLetter.trim()) return
    setApplying(true)
    const res = await fetch('/api/marketplace/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId, cover_letter: coverLetter.trim(),
        proposed_rate: proposedRate ? parseInt(proposedRate) : null,
      }),
    })
    if (res.ok) {
      toast.success('Application sent!')
      setCoverLetter(''); setProposedRate(''); setApplyingTo(null)
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Failed to apply')
    }
    setApplying(false)
  }

  const filtered = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ELEVO Marketplace</h1>
            <p className="text-sm text-dashMuted">Find talent or get hired — 10% commission on completed jobs</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dashCard border border-white/5 rounded-xl p-1">
        {[
          { key: 'browse' as const, label: 'Browse Jobs', icon: Search },
          { key: 'my-jobs' as const, label: 'My Jobs', icon: Briefcase },
          { key: 'post' as const, label: 'Post a Job', icon: Plus },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'text-dashMuted hover:text-white'
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Browse tab */}
      {tab === 'browse' && (
        <>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dashMuted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs…"
                className="w-full bg-dashCard border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-dashCard text-dashMuted hover:text-white border border-white/5'
                }`}>{cat}</button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-dashMuted mx-auto mb-4" />
              <p className="text-dashMuted text-sm">No jobs found. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(job => (
                <div key={job.id} className="bg-dashCard border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-white">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${CATEGORY_COLORS[job.category] ?? 'bg-gray-500'}`}>{job.category}</span>
                        {job.budget_max && (
                          <span className="text-xs text-dashMuted flex items-center gap-0.5"><DollarSign className="w-3 h-3" />{job.budget_min ?? 0}–{job.budget_max} {job.currency}</span>
                        )}
                        {job.deadline && (
                          <span className="text-xs text-dashMuted flex items-center gap-0.5"><Clock className="w-3 h-3" />{new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </div>
                    </div>
                    {job.poster_id !== userId && (
                      <button onClick={() => setApplyingTo(applyingTo === job.id ? null : job.id)}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        Apply <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-dashMuted line-clamp-2 mb-2">{job.description}</p>
                  {job.skills.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {job.skills.map(s => (
                        <span key={s} className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />{s}</span>
                      ))}
                    </div>
                  )}
                  {/* Apply form */}
                  {applyingTo === job.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Why are you a good fit for this job?" rows={3}
                        className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none" />
                      <div className="flex gap-2">
                        <input type="number" value={proposedRate} onChange={e => setProposedRate(e.target.value)} placeholder="Your rate (€)"
                          className="w-32 bg-dashBg border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
                        <button onClick={() => handleApply(job.id)} disabled={!coverLetter.trim() || applying}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
                          <Send className="w-3.5 h-3.5" />{applying ? 'Sending…' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My jobs tab */}
      {tab === 'my-jobs' && (
        <>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-dashCard border border-white/5 rounded-xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-dashMuted mx-auto mb-4" />
              <p className="text-dashMuted text-sm mb-4">You haven&apos;t posted any jobs yet.</p>
              {canPost && <button onClick={() => setTab('post')} className="text-sm text-indigo-400 hover:text-indigo-300">Post your first job →</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(job => (
                <div key={job.id} className="bg-dashCard border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">{job.title}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      job.status === 'open' ? 'text-green-400 bg-green-500/10' :
                      job.status === 'in_progress' ? 'text-blue-400 bg-blue-500/10' :
                      job.status === 'completed' ? 'text-dashMuted bg-white/5' : 'text-red-400 bg-red-500/10'
                    }`}>{job.status}</span>
                  </div>
                  <p className="text-sm text-dashMuted mt-1">{job.category} · Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Post job tab */}
      {tab === 'post' && (
        <>
          {!canPost ? (
            <div className="bg-dashCard border border-white/5 rounded-2xl p-10 text-center">
              <Lock className="w-10 h-10 text-dashMuted mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Post Jobs on the Marketplace</h2>
              <p className="text-dashMuted mb-6">Upgrade to Orbit (€79/mo) to post up to 3 jobs per month, or Galaxy (€149/mo) for unlimited.</p>
              <Link href={`/${locale}/pricing`} className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
                Upgrade now →
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePostJob} className="bg-dashCard border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Post a New Job</h2>
              <p className="text-xs text-dashMuted">ELEVO takes a 10% commission on completed jobs.</p>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Job title"
                className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the job, requirements, and deliverables" rows={4}
                className="w-full bg-dashBg border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="bg-dashBg border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma-separated)"
                  className="bg-dashBg border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder="Budget min (€)"
                  className="bg-dashBg border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="Budget max (€)"
                  className="bg-dashBg border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <button type="submit" disabled={!title.trim() || !description.trim() || posting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
                {posting ? 'Posting…' : 'Post Job'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

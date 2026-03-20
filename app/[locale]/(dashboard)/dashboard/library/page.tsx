'use client'

import { useState, useEffect } from 'react'
import { Library, Trash2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import CopyButton from '@/components/shared/CopyButton'
import EmptyState from '@/components/shared/EmptyState'
import { timeAgo, truncate } from '@/lib/utils'

interface Generation {
  id: string
  type: string
  content: string
  seo_score: number | null
  word_count: number | null
  created_at: string
}

const typeLabel: Record<string, string> = {
  gbp_post: 'GBP Post', blog: 'Blog', social_caption: 'Social', review_response: 'Review',
  email: 'Email', seo: 'SEO', repurposed: 'Repurpose',
}

const typeColors: Record<string, string> = {
  gbp_post: 'text-blue-400 bg-blue-400/10', blog: 'text-purple-400 bg-purple-400/10',
  social_caption: 'text-pink-400 bg-pink-400/10', review_response: 'text-amber-400 bg-amber-400/10',
  email: 'text-green-400 bg-green-400/10', seo: 'text-cyan-400 bg-cyan-400/10',
  repurposed: 'text-dashMuted bg-dashSurface',
}

const allTypes = ['all', 'gbp_post', 'blog', 'social_caption', 'review_response', 'email', 'seo']

export default function LibraryPage({ params }: { params: { locale: string } }) {
  const supabase = createBrowserClient()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase.from('saved_generations').select('id, type, content, seo_score, word_count, created_at').eq('user_id', user.id).order('created_at', { ascending: false })

    if (typeFilter !== 'all') query = query.eq('type', typeFilter)

    const { data } = await query.limit(50)
    if (data) setGenerations(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [typeFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this generation?')) return
    await supabase.from('saved_generations').delete().eq('id', id)
    setGenerations(prev => prev.filter(g => g.id !== id))
  }

  const filtered = search ? generations.filter(g => g.content.toLowerCase().includes(search.toLowerCase())) : generations

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dashText">Library</h1>
        <p className="text-dashMuted text-sm mt-1">All your saved content generations</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." className="px-3 py-2 bg-dashCard border border-dashSurface2 rounded-lg text-sm text-dashText placeholder:text-dashMuted focus:outline-none focus:ring-2 focus:ring-accent w-48" />
        <div className="flex gap-1 flex-wrap">
          {allTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? 'bg-accent text-white' : 'bg-dashCard text-dashMuted border border-dashSurface2 hover:text-dashText'}`}>
              {t === 'all' ? 'All' : typeLabel[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-dashCard rounded-xl border border-dashSurface2 p-4 h-36 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Library} title="No content saved yet" description="Generations you save will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(gen => (
            <div key={gen.id} className="bg-dashCard rounded-xl border border-dashSurface2 p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColors[gen.type] ?? 'text-dashMuted bg-dashSurface'}`}>
                  {typeLabel[gen.type] ?? gen.type}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {gen.seo_score && (
                    <span className={`text-xs font-medium ${gen.seo_score >= 80 ? 'text-green-400' : gen.seo_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      SEO {gen.seo_score}
                    </span>
                  )}
                  <span className="text-xs text-dashMuted">{timeAgo(gen.created_at)}</span>
                </div>
              </div>

              <p className="text-sm text-dashText leading-relaxed flex-1">{truncate(gen.content, 120)}</p>

              <div className="flex items-center justify-between pt-2 border-t border-dashSurface2">
                <CopyButton text={gen.content} size="sm" />
                <button onClick={() => handleDelete(gen.id)} className="text-dashMuted hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

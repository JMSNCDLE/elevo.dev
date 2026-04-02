'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Users, Clock, CheckCircle2, AlertCircle, Eye, Mail, Filter, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  subject_en: string
  subject_es: string
  body_en: string
  body_es: string
  audience: string
  status: string
  total_recipients: number
  sent_count: number
  skipped_count: number
  error_count: number
  sent_at: string | null
  scheduled_at: string | null
  created_at: string
}

const AUDIENCES = [
  { value: 'all', label: 'All Users', labelEs: 'Todos los usuarios' },
  { value: 'trial', label: 'Trial Users', labelEs: 'Usuarios en prueba' },
  { value: 'launch', label: 'Launch Plan', labelEs: 'Plan Launch' },
  { value: 'orbit', label: 'Orbit Plan', labelEs: 'Plan Orbit' },
  { value: 'galaxy', label: 'Galaxy Plan', labelEs: 'Plan Galaxy' },
  { value: 'churned', label: 'Churned Users', labelEs: 'Usuarios perdidos' },
]

const TEMPLATES = [
  {
    name: 'Upgrade to Orbit',
    nameEs: 'Actualizar a Orbit',
    subject_en: 'Unlock 300 credits/month and 15+ premium agents',
    subject_es: 'Desbloquea 300 créditos/mes y más de 15 agentes premium',
    body_en: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">Ready for the next level?</h2>
<p>You've been using ELEVO AI and we think you're ready for more.</p>
<p><strong>ELEVO Orbit™ (€49.99/month)</strong> unlocks:</p>
<ul style="line-height:2">
<li><strong>300 credits/month</strong> (vs 20 on trial, 100 on Launch)</li>
<li><strong>ELEVO Spy™</strong> — competitor intelligence with weekly monitoring</li>
<li><strong>ELEVO Viral™</strong> — trending content strategy with 50+ hooks</li>
<li><strong>ELEVO Market™</strong> — AI marketing autopilot for 30-day campaigns</li>
<li><strong>Growth Reports</strong> — sales proposals, market research, SWOT strategy</li>
</ul>
<p>Businesses on Orbit generate 4x more content and see 2.3x higher engagement.</p>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/en/pricing" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Upgrade to Orbit →</a></div>`,
    body_es: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">¿Listo para el siguiente nivel?</h2>
<p>Has estado usando ELEVO AI y creemos que estás listo para más.</p>
<p><strong>ELEVO Orbit™ (€49.99/mes)</strong> desbloquea:</p>
<ul style="line-height:2">
<li><strong>300 créditos/mes</strong> (vs 20 en prueba, 100 en Launch)</li>
<li><strong>ELEVO Spy™</strong> — inteligencia competitiva con monitoreo semanal</li>
<li><strong>ELEVO Viral™</strong> — estrategia de contenido viral con más de 50 ganchos</li>
<li><strong>ELEVO Market™</strong> — piloto automático de marketing con IA</li>
<li><strong>Informes de crecimiento</strong> — propuestas comerciales, investigación de mercado, SWOT</li>
</ul>
<p>Los negocios en Orbit generan 4x más contenido y ven 2.3x más engagement.</p>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/es/pricing" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Actualizar a Orbit →</a></div>`,
    audience: 'launch',
  },
  {
    name: 'Upgrade to Galaxy',
    nameEs: 'Actualizar a Galaxy',
    subject_en: 'Go unlimited with ELEVO Galaxy™',
    subject_es: 'Sin límites con ELEVO Galaxy™',
    body_en: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">Unlock everything ELEVO has to offer</h2>
<p><strong>ELEVO Galaxy™ (€79.99/month)</strong> is the ultimate plan:</p>
<ul style="line-height:2">
<li><strong>999 credits/month</strong> — practically unlimited</li>
<li><strong>ELEVO Drop™</strong> — AI dropshipping product finder</li>
<li><strong>ELEVO Deep™</strong> — Opus-powered deep execution (10 credits per use)</li>
<li><strong>Store Analytics</strong> — Shopify/WooCommerce dashboard</li>
<li><strong>Auto-execute missions</strong> — marketing runs on autopilot daily</li>
<li>Everything in Orbit, plus priority support</li>
</ul>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/en/pricing" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Upgrade to Galaxy →</a></div>`,
    body_es: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">Desbloquea todo lo que ELEVO tiene para ofrecer</h2>
<p><strong>ELEVO Galaxy™ (€149/mes)</strong> es el plan definitivo:</p>
<ul style="line-height:2">
<li><strong>999 créditos/mes</strong> — prácticamente ilimitado</li>
<li><strong>ELEVO Drop™</strong> — buscador de productos con IA</li>
<li><strong>ELEVO Deep™</strong> — ejecución profunda con Opus</li>
<li><strong>Store Analytics</strong> — panel de Shopify/WooCommerce</li>
<li><strong>Misiones auto-ejecutables</strong> — marketing diario en piloto automático</li>
<li>Todo lo de Orbit, más soporte prioritario</li>
</ul>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/es/pricing" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Actualizar a Galaxy →</a></div>`,
    audience: 'orbit',
  },
  {
    name: 'New Feature Announcement',
    nameEs: 'Anuncio de nueva función',
    subject_en: "We just shipped something big — here's what's new",
    subject_es: 'Acabamos de lanzar algo grande — esto es lo nuevo',
    body_en: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">New in ELEVO AI</h2>
<p>We've been busy building. Here's what just landed:</p>
<ul style="line-height:2">
<li><strong>[Feature Name]</strong> — [One-line description]</li>
<li><strong>[Feature Name]</strong> — [One-line description]</li>
<li><strong>[Feature Name]</strong> — [One-line description]</li>
</ul>
<p>All available now in your dashboard.</p>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/en/dashboard" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Try it now →</a></div>`,
    body_es: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">Novedades en ELEVO AI</h2>
<p>Hemos estado trabajando duro. Esto es lo que acaba de llegar:</p>
<ul style="line-height:2">
<li><strong>[Nombre de función]</strong> — [Descripción breve]</li>
<li><strong>[Nombre de función]</strong> — [Descripción breve]</li>
<li><strong>[Nombre de función]</strong> — [Descripción breve]</li>
</ul>
<p>Todo disponible ahora en tu panel.</p>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/es/dashboard" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Probarlo ahora →</a></div>`,
    audience: 'all',
  },
  {
    name: 'Monthly Newsletter',
    nameEs: 'Newsletter mensual',
    subject_en: 'Your ELEVO AI month in review',
    subject_es: 'Tu mes con ELEVO AI en resumen',
    body_en: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">This month at ELEVO AI</h2>
<p>Here's a quick recap of what happened this month:</p>
<h3 style="color:#6366F1;font-size:16px;margin:20px 0 8px">Platform Updates</h3>
<ul style="line-height:2">
<li>[Update 1]</li>
<li>[Update 2]</li>
</ul>
<h3 style="color:#6366F1;font-size:16px;margin:20px 0 8px">Community Wins</h3>
<p>[Highlight real user results here]</p>
<h3 style="color:#6366F1;font-size:16px;margin:20px 0 8px">Coming Next Month</h3>
<p>[Preview upcoming features]</p>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/en/dashboard" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Go to dashboard →</a></div>`,
    body_es: `<h2 style="color:#18181b;font-size:20px;margin:0 0 16px">Este mes en ELEVO AI</h2>
<p>Un resumen rápido de lo que pasó este mes:</p>
<h3 style="color:#6366F1;font-size:16px;margin:20px 0 8px">Actualizaciones de la plataforma</h3>
<ul style="line-height:2">
<li>[Actualización 1]</li>
<li>[Actualización 2]</li>
</ul>
<h3 style="color:#6366F1;font-size:16px;margin:20px 0 8px">Éxitos de la comunidad</h3>
<p>[Destacar resultados reales de usuarios]</p>
<h3 style="color:#6366F1;font-size:16px;margin:20px 0 8px">Próximamente</h3>
<p>[Previsualizar próximas funciones]</p>
<div style="margin:24px 0;text-align:center"><a href="https://elevo.dev/es/dashboard" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none">Ir al panel →</a></div>`,
    audience: 'all',
  },
]

export default function EmailCampaignsPage() {
  const [tab, setTab] = useState<'compose' | 'history' | 'templates'>('compose')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(false)
  const [result, setResult] = useState<{ sent: number; skipped: number; errors: number } | null>(null)

  // Form state
  const [subjectEn, setSubjectEn] = useState('')
  const [subjectEs, setSubjectEs] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [bodyEs, setBodyEs] = useState('')
  const [audience, setAudience] = useState('all')
  const [previewLang, setPreviewLang] = useState<'en' | 'es'>('en')

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/send-campaign')
      if (res.ok) setCampaigns(await res.json())
    } catch {}
  }, [])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])

  const loadTemplate = (idx: number) => {
    const t = TEMPLATES[idx]
    setSubjectEn(t.subject_en)
    setSubjectEs(t.subject_es)
    setBodyEn(t.body_en)
    setBodyEs(t.body_es)
    setAudience(t.audience)
    setTab('compose')
  }

  const sendCampaign = async () => {
    if (!subjectEn || !bodyEn) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_en: subjectEn,
          subject_es: subjectEs || subjectEn,
          body_en: bodyEn,
          body_es: bodyEs || bodyEn,
          audience,
          sendNow: true,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setResult({ sent: data.sent, skipped: data.skipped, errors: data.errors })
        loadCampaigns()
      }
    } catch {} finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-[#EEF2FF] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Mail size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Email Campaigns</h1>
            <p className="text-sm text-gray-400">Campañas de correo electrónico</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'compose' as const, label: 'Compose', icon: Send },
            { id: 'templates' as const, label: 'Templates', icon: FileText },
            { id: 'history' as const, label: 'History', icon: Clock },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t.id ? 'bg-indigo-600 text-white' : 'bg-[#1A2332] text-gray-400 hover:text-white'
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Templates Tab */}
        {tab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((t, i) => (
              <div key={i} className="bg-[#1A2332] rounded-xl p-5 border border-white/5">
                <h3 className="font-semibold mb-1">{t.name}</h3>
                <p className="text-sm text-gray-400 mb-1">{t.nameEs}</p>
                <p className="text-xs text-gray-500 mb-3">Audience: {AUDIENCES.find(a => a.value === t.audience)?.label}</p>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{t.subject_en}</p>
                <button
                  onClick={() => loadTemplate(i)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Use this template →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Compose Tab */}
        {tab === 'compose' && (
          <div className="space-y-6">
            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter size={14} className="inline mr-1" />
                Audience / Audiencia
              </label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setAudience(a.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      audience === a.value ? 'bg-indigo-600 text-white' : 'bg-[#1A2332] text-gray-400 hover:text-white'
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject (EN)</label>
                <input
                  value={subjectEn}
                  onChange={e => setSubjectEn(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#141B24] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your subject line here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject (ES)</label>
                <input
                  value={subjectEs}
                  onChange={e => setSubjectEs(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#141B24] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tu línea de asunto aquí..."
                />
              </div>
            </div>

            {/* Bodies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Body HTML (EN)</label>
                <textarea
                  value={bodyEn}
                  onChange={e => setBodyEn(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2.5 bg-[#141B24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  placeholder="<h2>Your headline</h2><p>Your content...</p>"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Body HTML (ES)</label>
                <textarea
                  value={bodyEs}
                  onChange={e => setBodyEs(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2.5 bg-[#141B24] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  placeholder="<h2>Tu titular</h2><p>Tu contenido...</p>"
                />
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-white rounded-xl p-6 text-gray-900">
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setPreviewLang('en')} className={cn('text-sm px-3 py-1 rounded', previewLang === 'en' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500')}>EN</button>
                  <button onClick={() => setPreviewLang('es')} className={cn('text-sm px-3 py-1 rounded', previewLang === 'es' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500')}>ES</button>
                </div>
                <p className="text-xs text-gray-400 mb-1">Subject:</p>
                <p className="font-semibold mb-4">{previewLang === 'es' ? (subjectEs || subjectEn) : subjectEn}</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewLang === 'es' ? (bodyEs || bodyEn) : bodyEn }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1A2332] rounded-lg text-sm font-medium hover:bg-[#1E2A3A] transition-colors"
              >
                <Eye size={16} />
                {preview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={sendCampaign}
                disabled={sending || !subjectEn || !bodyEn}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? 'Sending...' : 'Send Now'}
              </button>
              <span className="text-xs text-gray-500">Max 2 promotional emails per user per month (GDPR)</span>
            </div>

            {/* Result */}
            {result && (
              <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <div className="text-sm">
                  <span className="text-emerald-400 font-semibold">{result.sent} sent</span>
                  {result.skipped > 0 && <span className="text-gray-400 ml-3">{result.skipped} skipped (unsubscribed/limit)</span>}
                  {result.errors > 0 && <span className="text-red-400 ml-3">{result.errors} errors</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="space-y-3">
            {campaigns.length === 0 && (
              <p className="text-center text-gray-500 py-12">No campaigns sent yet</p>
            )}
            {campaigns.map(c => (
              <div key={c.id} className="bg-[#1A2332] rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.subject_en}</p>
                    <p className="text-sm text-gray-400 truncate">{c.subject_es}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {AUDIENCES.find(a => a.value === c.audience)?.label ?? c.audience}
                      </span>
                      <span>{new Date(c.sent_at ?? c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      c.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                      c.status === 'sending' ? 'bg-amber-500/20 text-amber-400' :
                      c.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    )}>
                      {c.status}
                    </span>
                    {c.status === 'sent' && (
                      <span className="text-gray-400">
                        {c.sent_count ?? 0} sent · {c.skipped_count ?? 0} skipped
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

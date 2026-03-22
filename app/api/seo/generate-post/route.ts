import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateSEOBlogPost } from '@/lib/agents/seoAgent'

const schema = z.object({
  topic: z.string().min(1),
  targetKeyword: z.string().min(1),
  locale: z.string().default('en'),
  category: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { topic, targetKeyword, locale, category } = parsed.data

  const post = await generateSEOBlogPost(
    topic,
    targetKeyword,
    'ELEVO AI — AI operating system for local businesses',
    locale
  )

  const { data: saved, error } = await supabase
    .from('blog_posts')
    .insert({
      slug: post.slug,
      locale,
      title: post.title,
      meta_title: post.metaTitle,
      meta_description: post.metaDescription,
      content: post.content,
      excerpt: post.metaDescription,
      target_keyword: targetKeyword,
      category: category ?? null,
      reading_time: Math.ceil(post.wordCount / 200),
      faq_section: post.faqSection,
      published: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: saved })
}

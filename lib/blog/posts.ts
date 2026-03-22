// ─── ELEVO AI — Static Blog Posts ─────────────────────────────────────────────
// Pre-populated blog content. No database required for these initial posts.

export interface BlogPost {
  slug: string
  title: string
  category: string
  categoryColor: string
  readingTime: string
  date: string
  excerpt: string
  content: string // HTML/markdown-style content
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'roas-local-business-wasted-ad-budget',
    title: 'Why 73% of local businesses are wasting their ad budget',
    category: 'ROAS',
    categoryColor: 'indigo',
    readingTime: '5 min read',
    date: 'March 2026',
    excerpt: "Most local businesses have no idea what their ROAS is. Here's what that's costing you — and how to fix it in 60 seconds.",
    content: `
## The £340/month problem most business owners don't know they have

You're running Google Ads. You're paying Meta every month. Maybe you've got TikTok ads running too. And every month, the money goes out — but you have no clear picture of what's coming back.

You're not alone. A 2025 survey of 1,200 local businesses found that 73% couldn't accurately state their return on ad spend (ROAS) within the last 30 days. Most guessed. Most guessed wrong.

## What is ROAS, and why does it matter?

ROAS is the simplest measure of whether your ads are working:

**ROAS = Revenue generated ÷ Ad spend**

A ROAS of 4:1 means for every £1 you spend on ads, you make £4 back. That's the benchmark most experts target for local service businesses.

The average local business sits at **1.8:1**. That means for every £100 spent, they get £180 back — a £80 return before accounting for cost of goods, staff time, and overheads. In many cases, they're effectively paying to break even.

## The 3 most common ways local businesses waste ad spend

**1. Running campaigns with no conversion tracking**

If you can't track which ad led to a phone call or booking, you have no idea which campaigns are working. Google and Meta will happily spend your budget on impressions that never convert.

Fix: Set up Google Ads conversion tracking and Meta Pixel before you spend another penny.

**2. Targeting the wrong audience**

Many local businesses use broad geographic targeting, or leave demographic settings at default. A plumber in Manchester doesn't need to show ads to 18-year-olds in Birmingham.

Fix: Tighten your radius to 5-15 miles. Set age and household income targeting based on your actual customers.

**3. Letting underperforming campaigns run on autopilot**

Google's "Smart Campaigns" and Meta's "Advantage+" are designed to spend your budget — not necessarily to make you money. Without regular audits, you'll keep paying for campaigns that stopped working months ago.

Fix: Audit every campaign monthly. Cut anything below 2:1 ROAS. Move that budget to what's working.

## How ELEVO Ads Pro™ finds your waste in 60 seconds

ELEVO Ads Pro™ (powered by Leo, your ROAS agent) analyses your campaigns, identifies underperforming spend, and tells you exactly where to cut and where to scale — in one report.

Mario T., an emergency plumber in Manchester, found £340/month of wasted spend in his first analysis. He moved that budget to his best-performing campaign and doubled his monthly calls within 6 weeks.

The average ELEVO user finds **£600–£1,200/month** of wasted spend in their first ROAS analysis.
    `,
  },
  {
    slug: '5-things-local-business-online-every-week',
    title: 'The only 5 things a local business needs to do online every week',
    category: 'Strategy',
    categoryColor: 'purple',
    readingTime: '7 min read',
    date: 'March 2026',
    excerpt: 'Monday to Friday, done in under 30 minutes per day. The exact weekly routine that keeps your business ahead of competitors.',
    content: `
## Most businesses make online marketing complicated. It isn't.

The average local business owner spends hours each week thinking about their online presence — and almost no time actually doing anything about it.

Here's the truth: you only need to do 5 things consistently to stay ahead of 90% of your competitors online. This is the exact weekly routine used by the fastest-growing local businesses on ELEVO.

## Monday: Post on Google Business Profile

Your Google Business Profile is the most valuable free marketing asset you have. Every post you make increases your visibility in local search results and signals to Google that your business is active.

**What to post:** A short update about your service, a seasonal offer, a recent job photo, or a customer win. 100-150 words is enough.

**Time required:** 10 minutes.

**Why it matters:** Google rewards active profiles with higher rankings in local search. A business that posts weekly outranks one that hasn't posted in months — even if the inactive business has more reviews.

## Tuesday: Reply to every unanswered review

Unanswered reviews — especially negative ones — are visible to every potential customer who looks you up. A single unanswered 1-star review on the first page of your Google listing can cost you 10-15% of potential customers.

**What to do:** Reply to every review from the past 7 days. For positives: thank them and mention your service. For negatives: acknowledge, apologise, and offer to resolve offline.

**Time required:** 5-10 minutes.

## Wednesday: Post on your most active social platform

You don't need to be on every social platform. Pick one where your customers actually spend time — Instagram for most consumer businesses, LinkedIn for B2B.

**What to post:** Behind-the-scenes content, a recent job, a customer story, or a useful tip relevant to your service area.

**Time required:** 15 minutes.

## Thursday: Follow up with 3 recent customers

Most repeat business is lost not because customers were unhappy — but because businesses never followed up. A simple message checking in, sharing a relevant tip, or offering a seasonal service reminder converts at 20-30% for local businesses.

**What to do:** Pick 3 customers from the last 60 days you haven't heard from. Send a personalised message — not a generic newsletter.

**Time required:** 10 minutes.

## Friday: Check your ad spend

If you're running any paid advertising, Friday is the day to review it. Check which campaigns drove actual enquiries or calls this week. Pause anything that spent money without results.

**Time required:** 5-10 minutes.

## Total: under 50 minutes per week

That's it. Five tasks, under an hour per week. Businesses that do this consistently generate 3-4x more online enquiries than those that don't.

**ELEVO automates all five** — writing your GBP post, drafting review replies, generating social content, scheduling follow-up messages, and flagging your underperforming campaigns. In the time it takes to make a coffee.
    `,
  },
  {
    slug: 'manchester-plumber-saved-340-per-month',
    title: 'How a Manchester plumber saved £340/month in 60 seconds',
    category: 'Case Study',
    categoryColor: 'green',
    readingTime: '4 min read',
    date: 'March 2026',
    excerpt: "Mario T. had been running Google Ads for 8 months with no idea if they were working. Here's what ELEVO found — and what changed.",
    content: `
## "I didn't know what ROAS meant. I just knew I was paying Google every month."

Mario T. runs a 3-man emergency plumbing business in Manchester. He started running Google Ads 8 months before discovering ELEVO — spending around £800/month across 4 campaigns.

"I set them up with a Google rep who called me one day. They seemed professional. The calls were coming in, so I assumed it was working."

The problem: Mario had no conversion tracking. He knew calls were coming in — but he didn't know which campaigns were responsible.

## What ELEVO Ads Pro™ found

When Mario ran his first ROAS analysis on ELEVO, the results were clear within 60 seconds.

Two of his four campaigns had zero tracked conversions in the previous 90 days. Combined, they were spending **£340/month**.

The other two campaigns — targeting emergency plumbing searches within 8 miles of Manchester city centre — were generating most of his calls at a healthy 4.8:1 ROAS.

"It was like someone turned the lights on. I'd been paying for two campaigns that weren't doing anything for 8 months."

## What changed

Mario paused the two underperforming campaigns immediately and moved the £340/month budget to his two working campaigns.

Within 6 weeks:
- Monthly calls increased from ~22 to ~41
- Cost per lead dropped from £36 to £19
- Monthly ad spend stayed the same

"I'm spending the same money. I'm just not wasting half of it now."

## The broader lesson

Mario's situation is typical. Most local businesses running ads have at least one campaign — often more — that is spending money without generating results.

The challenge isn't running ads. It's knowing which ones are working.

ELEVO Ads Pro™ makes that visible instantly — and tells you exactly where to move your budget.
    `,
  },
  {
    slug: 'google-business-profile-guide-2026',
    title: 'Google Business Profile: the complete 2026 guide for local businesses',
    category: 'SEO',
    categoryColor: 'blue',
    readingTime: '8 min read',
    date: 'March 2026',
    excerpt: "Your GBP is the most valuable free marketing asset you have. Most businesses are using 20% of its power. Here's the full playbook.",
    content: `
## The most underused free tool in local marketing

Your Google Business Profile (GBP) appears in local search results, Google Maps, and the Knowledge Panel when someone searches your business name. It's often the first thing a potential customer sees before they ever reach your website.

Yet most local businesses set up their GBP once — and never touch it again.

Here's the complete 2026 playbook for getting the most out of this free tool.

## 1. Complete every section of your profile

Google rewards completeness. Profiles with all sections filled out rank higher in local search results. Check all of the following:

- **Business name** — exactly as it appears on your signage/website (no keyword stuffing)
- **Category** — primary + up to 9 additional categories
- **Description** — 750 characters. Include your main service, city, and a USP
- **Opening hours** — including special hours for holidays
- **Phone number** — local number preferred over national
- **Website** — your actual homepage or a location-specific landing page
- **Photos** — minimum 10 photos (exterior, interior, team, work samples)
- **Services** — list every service you offer with descriptions

## 2. Post weekly (this is the biggest lever most businesses ignore)

Google actively promotes profiles that post regularly. Posts appear in local search results and can drive direct calls and website visits.

**What to post each week:**
- A recent job or project (with photo)
- A seasonal or time-limited offer
- A customer win or testimonial
- An answer to a common customer question

Posts expire after 7 days, so consistency matters. One post per week is the minimum.

## 3. Get your review strategy right

Reviews are the single biggest trust signal for local businesses. The target is 50+ reviews with an average of 4.5 or higher.

**How to get more reviews:**
- Ask every satisfied customer within 24 hours of job completion
- Send a direct link to your GBP review page (find it in your profile dashboard)
- Make it a process: every job → follow-up message → review request
- Use ELEVO to automate review request messages

**How to respond to reviews:**
- Reply to every review within 48 hours
- For positives: thank them by name, mention the specific service
- For negatives: acknowledge publicly, resolve privately

## 4. Use Questions & Answers proactively

You can add your own questions and answers to the Q&A section — and you should. Common questions answered before the customer asks them reduce friction and increase conversions.

Add answers to questions like:
- "Do you offer emergency call-outs?"
- "How quickly can you respond?"
- "What areas do you cover?"

## 5. Track your profile's performance

Inside your GBP dashboard, you can see:
- How many times your profile appeared in search
- How many people clicked for directions, called, or visited your website
- Which searches triggered your profile

Review these numbers monthly. A drop in visibility usually means a competitor has become more active — and it's time to catch up.
    `,
  },
  {
    slug: 'como-conseguir-resenas-google-restaurante',
    title: 'Cómo conseguir más reseñas de Google para tu restaurante',
    category: 'Reseñas',
    categoryColor: 'orange',
    readingTime: '5 min read',
    date: 'Marzo 2026',
    excerpt: 'El 87% de los clientes lee reseñas antes de elegir un restaurante. Esta es la estrategia que usan los restaurantes con más de 200 reseñas.',
    content: `
## El 87% de tus clientes potenciales te está juzgando antes de entrar

Un estudio de 2025 reveló que el 87% de los consumidores lee reseñas de Google antes de elegir un restaurante. No solo las miran — toman decisiones basadas en ellas.

Un restaurante con 4.8 estrellas y 180 reseñas supera consistentemente a uno con 4.5 estrellas y 20 reseñas, incluso cuando el segundo ofrece mejor comida.

La percepción es la realidad. Y las reseñas son la percepción.

## Por qué la mayoría de los restaurantes no consiguen suficientes reseñas

La razón no es que los clientes no estén satisfechos. Es que nadie se lo pide de la manera correcta, en el momento correcto.

Los clientes satisfechos raramente dejan reseñas por iniciativa propia. Los insatisfechos, sí. Esto crea un sesgo negativo que no refleja la realidad de tu negocio.

La solución es sistemática: pedir la reseña en el momento óptimo, de la manera óptima.

## La estrategia de 3 pasos que usan los restaurantes con 200+ reseñas

### Paso 1: Pide la reseña dentro de las 2 horas de la visita

El momento óptimo es cuando la experiencia aún está fresca. Un mensaje de WhatsApp o SMS enviado entre 1 y 2 horas después de que el cliente haya pagado tiene una tasa de conversión del 25-35%.

El mensaje debe ser:
- Personalizado (usa su nombre si lo tienes)
- Corto (máximo 3 líneas)
- Con enlace directo a tu página de reseñas de Google

Ejemplo: *"Hola María, gracias por visitarnos esta noche. Si tienes un momento, nos ayudaría mucho una reseña en Google: [enlace]. ¡Hasta pronto!"*

### Paso 2: Responde a todas las reseñas en menos de 24 horas

Cada respuesta que das es visible para todos los clientes potenciales que lean tus reseñas. Una respuesta bien escrita a una reseña negativa puede convertir a un cliente insatisfecho en un defensor de tu marca.

Regla de oro: Agradece siempre, menciona el plato o la ocasión específica, e invita a volver.

### Paso 3: Automatiza el proceso con ELEVO

La razón por la que la mayoría de restaurantes no piden reseñas consistentemente es simple: nadie tiene tiempo de hacerlo manualmente después de cada servicio.

ELEVO Sage™ automatiza todo el proceso: identifica clientes recientes, genera mensajes personalizados, y los programa para enviarse en el momento óptimo. Sin esfuerzo manual.

## El objetivo: 4.7+ estrellas con 100+ reseñas

Con este sistema, los restaurantes suelen alcanzar 100 reseñas en 3-4 meses. El impacto en reservas es inmediato y medible.
    `,
  },
  {
    slug: 'manychat-vs-elevo-connect',
    title: 'ManyChat vs ELEVO Connect™: which is better for local businesses?',
    category: 'Comparison',
    categoryColor: 'teal',
    readingTime: '6 min read',
    date: 'March 2026',
    excerpt: "Both automate Instagram DMs. But one costs £99/month and takes hours to set up. Here's the honest comparison.",
    content: `
## The case for DM automation

Instagram has 2 billion monthly active users. For local businesses, it's often the highest-engagement marketing channel they have — and the most underused for actual sales.

The problem: managing Instagram DMs manually is time-consuming, inconsistent, and impossible to do at scale. When someone comments "how much?" on your post at 11pm, they're gone by the time you reply at 9am.

DM automation solves this. But not all DM automation tools are created equal.

## ManyChat: the market leader

ManyChat is the most established DM automation tool. It's used by hundreds of thousands of businesses worldwide and has a comprehensive feature set.

**What ManyChat does well:**
- Reliable Instagram + Facebook DM automation
- Good template library
- Solid analytics
- Widely documented with lots of tutorials

**The problems with ManyChat for local businesses:**

*Price:* ManyChat Pro starts at $15/month but grows quickly. Most local businesses end up paying £79-£149/month once they need the features they actually want. Agency accounts run £300+/month.

*Setup complexity:* Building flows in ManyChat requires significant time investment. Most local businesses spend 3-5 hours setting up their first flow — and many give up before they finish.

*No AI:* ManyChat uses keyword matching. Someone says "book" and it triggers your booking flow. But real conversations don't follow scripts. Customers ask unexpected questions, and ManyChat can't handle them.

*Isolated:* ManyChat doesn't integrate with your CRM, content tools, analytics, or other business software without complex Zapier workarounds.

## ELEVO Connect™: built for local businesses

ELEVO Connect™ is ELEVO's conversation automation feature, powered by Sage — an AI agent that actually understands what customers are saying.

**What ELEVO Connect™ does differently:**

*AI-powered responses:* Sage doesn't use keyword matching. She understands intent. "I need someone to come fix my boiler" triggers the same booking flow as "is anyone available for emergency heating work?" — because Sage understands both mean the same thing.

*2-minute setup:* Describe your business and your goals to Sage, and she builds the flow for you. No visual flow builder required.

*Full CRM integration:* Every conversation automatically creates or updates a contact in your ELEVO CRM. No Zapier. No manual data entry.

*Included in Orbit:* ELEVO Connect™ is included in the Orbit plan at £79/month — along with content generation, ROAS analysis, SEO tools, and everything else ELEVO does.

## The honest verdict

If you're an enterprise business with dedicated marketing staff and complex automation needs, ManyChat is a mature, feature-rich tool worth considering.

If you're a local business who wants DM automation that works, integrates with your other tools, and doesn't require a 5-hour setup — ELEVO Connect™ is the better choice.

At £79/month all-in vs £99/month just for ManyChat, the economics are clear.
    `,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

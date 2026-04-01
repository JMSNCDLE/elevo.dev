import { NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'

export type UserContext = Awaited<ReturnType<typeof getUserContext>>

export function withUserContext(handler: (req: Request, ctx: UserContext) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const ctx = await getUserContext()
      if (!ctx.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return handler(req, ctx)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[withUserContext] ERROR:', msg)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }
}

export function withAdminContext(handler: (req: Request, ctx: UserContext) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const ctx = await getUserContext()
      if (!ctx.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (!ctx.isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      return handler(req, ctx)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[withAdminContext] ERROR:', msg)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }
}

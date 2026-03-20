import { cookies } from 'next/headers'

// Server-side: read cookie using next/headers (Server Components / Route Handlers only)
export async function getCookieValue(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

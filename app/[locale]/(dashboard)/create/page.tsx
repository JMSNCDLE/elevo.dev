// app/[locale]/(dashboard)/create/page.tsx
export default async function CreatePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ELEVO Create™</h1>
        <p className="text-muted-foreground mt-1">Loading your workspace...</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-surface animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-surface animate-pulse rounded-xl" />
    </div>
  )
}

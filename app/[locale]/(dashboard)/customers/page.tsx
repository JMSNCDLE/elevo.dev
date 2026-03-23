export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground capitalize">
        Customers
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted/20 animate-pulse rounded-xl" />
    </div>
  )
}

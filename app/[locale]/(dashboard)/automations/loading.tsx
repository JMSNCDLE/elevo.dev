export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-dashCard animate-pulse rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-dashCard animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-dashCard animate-pulse rounded-xl" />
    </div>
  )
}

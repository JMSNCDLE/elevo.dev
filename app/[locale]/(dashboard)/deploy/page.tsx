export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  await params
  return <div className="p-6"><h1 className="text-2xl font-bold">Loading...</h1></div>
}

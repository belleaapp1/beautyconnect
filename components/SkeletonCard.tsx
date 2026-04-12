export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-64 sm:h-72 bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="px-3 py-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

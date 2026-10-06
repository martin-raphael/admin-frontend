export default function InquiriesLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-ink-300/40" />
        <div className="mb-3 h-8 w-40 animate-pulse rounded bg-ink-300/40" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card relative overflow-hidden p-5">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-ink-300/40" />
            <div className="h-3 w-24 animate-pulse rounded bg-ink-300/30" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-ink-300/40" />
          </div>
        ))}
      </div>

      <div className="card mb-8 p-6">
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-ink-300/40" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-40 animate-pulse rounded bg-ink-300/30" />
                <div className="h-4 w-10 animate-pulse rounded bg-ink-300/30" />
              </div>
              <div className="h-1.5 w-full animate-pulse rounded-full bg-ink-300/20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
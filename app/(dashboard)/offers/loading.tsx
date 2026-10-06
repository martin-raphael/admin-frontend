export default function OffersLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-ink-300/40" />
        <div className="mb-3 h-8 w-40 animate-pulse rounded bg-ink-300/40" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
      </div>

      <div className="mb-6 flex justify-end">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-ink-300/30" />
      </div>

      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card relative overflow-hidden p-5">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-ink-300/40" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-6 w-48 animate-pulse rounded bg-ink-300/40" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-ink-300/30" />
                </div>
                <div className="mb-3 h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
                <div className="flex gap-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-ink-300/30" />
                  <div className="h-3 w-48 animate-pulse rounded bg-ink-300/30" />
                  <div className="h-3 w-20 animate-pulse rounded bg-ink-300/30" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-10 animate-pulse rounded bg-ink-300/30" />
                <div className="h-4 w-14 animate-pulse rounded bg-ink-300/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
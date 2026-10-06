export default function TestimonialsLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-ink-300/40" />
        <div className="mb-3 h-8 w-48 animate-pulse rounded bg-ink-300/40" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-ink-300/40 bg-white p-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-md bg-ink-300/30" />
          ))}
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-ink-300/30" />
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 items-start gap-4">
                <div className="mt-1 h-3 w-6 animate-pulse rounded bg-ink-300/30" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-ink-300/40" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-ink-300/30" />
                    <div className="h-3 w-10 animate-pulse rounded bg-ink-300/30" />
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-ink-300/30" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-ink-300/30" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-4 w-16 animate-pulse rounded bg-ink-300/30" />
                <div className="h-4 w-10 animate-pulse rounded bg-ink-300/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
export default function SettingsLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-ink-300/40" />
        <div className="mb-3 h-8 w-32 animate-pulse rounded bg-ink-300/40" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {[...Array(4)].map((_, i) => (
          <section key={i} className="card-padded">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-3 w-6 animate-pulse rounded bg-ink-300/40" />
              <div className="h-4 w-40 animate-pulse rounded bg-ink-300/40" />
              <div className="h-px flex-1 bg-ink-300/40" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 h-3 w-32 animate-pulse rounded bg-ink-300/30" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-ink-300/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 h-3 w-24 animate-pulse rounded bg-ink-300/30" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-ink-300/30" />
                </div>
                <div>
                  <div className="mb-2 h-3 w-24 animate-pulse rounded bg-ink-300/30" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-ink-300/30" />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
export default function DashboardLoading() {
  return (
    <>
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="mb-3 h-3 w-20 animate-pulse rounded bg-ink-300/40" />
        <div className="mb-3 h-8 w-48 animate-pulse rounded bg-ink-300/40" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
      </div>

      {/* Stat cards skeleton — matches the 4-column grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="card relative overflow-hidden p-5">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-ink-300/40" />
            <div className="h-3 w-24 animate-pulse rounded bg-ink-300/30" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-ink-300/40" />
          </div>
        ))}
      </div>

      {/* Sessions panel skeleton */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-ink-300/40 px-6 py-5">
          <div>
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-ink-300/30" />
            <div className="h-5 w-40 animate-pulse rounded bg-ink-300/40" />
          </div>
          <div className="h-3 w-32 animate-pulse rounded bg-ink-300/30" />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="w-16">
                <div className="h-3 w-4 animate-pulse rounded bg-ink-300/30" />
              </th>
              <th>
                <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
              </th>
              <th>
                <div className="h-3 w-20 animate-pulse rounded bg-ink-300/30" />
              </th>
              <th>
                <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
              </th>
              <th>
                <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
              </th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="h-3 w-6 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-ink-300/40" />
                    <div className="min-w-0 space-y-1.5">
                      <div className="h-4 w-40 animate-pulse rounded bg-ink-300/40" />
                      <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="h-4 w-24 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="mb-1 h-4 w-24 animate-pulse rounded bg-ink-300/40" />
                  <div className="h-3 w-32 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="mb-1 h-4 w-24 animate-pulse rounded bg-ink-300/40" />
                  <div className="h-3 w-32 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="ml-auto h-4 w-14 animate-pulse rounded bg-ink-300/30" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
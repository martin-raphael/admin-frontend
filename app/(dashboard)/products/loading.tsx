export default function ProductsLoading() {
  return (
    <>
      <div className="mb-8">
        <div className="mb-3 h-3 w-24 animate-pulse rounded bg-ink-300/40" />
        <div className="mb-3 h-8 w-40 animate-pulse rounded bg-ink-300/40" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-300/30" />
      </div>

      <div className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[220px] flex-1 space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-ink-300/30" />
        </div>
        <div className="min-w-[180px] space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-ink-300/30" />
        </div>
        <div className="min-w-[150px] space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-ink-300/30" />
        </div>
        <div className="h-10 w-20 animate-pulse rounded-lg bg-ink-300/30" />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="w-16"></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="h-3 w-6 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-md bg-ink-300/30" />
                    <div className="h-4 w-40 animate-pulse rounded bg-ink-300/40" />
                  </div>
                </td>
                <td>
                  <div className="h-3 w-16 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="h-4 w-24 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-ink-300/40" />
                </td>
                <td>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-ink-300/30" />
                </td>
                <td>
                  <div className="ml-auto h-4 w-10 animate-pulse rounded bg-ink-300/30" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
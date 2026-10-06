export default function CategoriesLoading() {
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

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="w-16"></th>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th className="w-40"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="h-3 w-6 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-md bg-ink-300/30" />
                    <div className="h-4 w-32 animate-pulse rounded bg-ink-300/40" />
                  </div>
                </td>
                <td>
                  <div className="h-3 w-24 animate-pulse rounded bg-ink-300/30" />
                </td>
                <td>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-ink-300/30" />
                </td>
                <td>
                  <div className="ml-auto flex gap-4">
                    <div className="h-4 w-10 animate-pulse rounded bg-ink-300/30" />
                    <div className="h-4 w-14 animate-pulse rounded bg-ink-300/30" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
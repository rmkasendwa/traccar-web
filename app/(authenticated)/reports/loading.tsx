export default function ReportsLoading() {
  return (
    <div
      className="h-full overflow-hidden bg-(--color-background) p-3 sm:p-4 lg:p-6"
      aria-label="Loading reports"
    >
      <div className="h-full rounded-2xl border border-(--color-divider) bg-(--color-paper) shadow-sm">
        <div className="border-b border-(--color-divider) p-5">
          <div className="h-4 w-32 rounded bg-(--color-surface-hover)" />
          <div className="mt-2 h-3 w-72 max-w-full rounded bg-(--color-surface-subtle)" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-11 rounded-xl bg-(--color-surface-subtle)" />
            ))}
          </div>
        </div>
        <div className="space-y-3 p-5">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 rounded-xl bg-(--color-surface-subtle)" />
          ))}
        </div>
      </div>
    </div>
  );
}

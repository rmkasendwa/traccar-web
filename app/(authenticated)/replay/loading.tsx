export default function ReplayLoading() {
  return (
    <main
      className="relative h-full overflow-hidden bg-[linear-gradient(135deg,#dbe5df,#f1f5f2,#d7e1dc)]"
      aria-label="Loading route replay"
    >
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.8),transparent_35%)]" />
      <div className="absolute inset-x-3 top-3 h-[calc(100%-12rem)] animate-pulse rounded-[1.35rem] border border-white/60 bg-white/90 shadow-2xl md:inset-x-auto md:bottom-3 md:h-auto md:w-[22rem]">
        <div className="h-20 rounded-t-[1.3rem] bg-slate-900" />
        <div className="space-y-4 p-4">
          <div className="h-11 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-9 rounded-lg bg-slate-100" />
            ))}
          </div>
          <div className="h-11 rounded-xl bg-slate-900" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-16 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

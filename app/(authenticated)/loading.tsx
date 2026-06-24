export default function Loading() {
  return (
    <div className="flex h-full bg-slate-100 p-3">
      <div className="hidden h-full w-[22rem] animate-pulse rounded-[1.4rem] bg-slate-900 md:block" />
      <div className="flex-1 animate-pulse bg-[linear-gradient(135deg,#dbe5df,#f1f5f2,#d7e1dc)]" />
    </div>
  );
}

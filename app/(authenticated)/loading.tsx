export default function Loading() {
  return (
    <div className="flex h-full bg-(--color-background) p-3">
      <div className="hidden h-full w-88 animate-pulse rounded-[1.4rem] border border-(--color-divider) bg-(--color-sidebar) md:block" />
      <div className="flex-1 animate-pulse bg-[linear-gradient(135deg,var(--color-background),var(--color-surface-subtle),var(--color-divider))]" />
    </div>
  );
}

'use client';

import { ArrowLeft, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import ThemeModeControl from '@/components/ui/ThemeModeControl';

export type SectionNavigationItem = {
  label: string;
  href: string;
  icon: ReactNode;
  description?: string;
};

export type SectionNavigationGroup = {
  title: string;
  items: SectionNavigationItem[];
  collapsible?: boolean;
};

type SectionShellProps = {
  title: string;
  description: string;
  groups: SectionNavigationGroup[];
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
};

function Navigation({
  groups,
  onNavigate,
}: {
  groups: SectionNavigationGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const items = (group: SectionNavigationGroup) => (
    <div className="mt-1.5 space-y-1">
      {group.items.map((item) => {
        const active = pathname === item.href.split('?')[0];
        return (
          <Link
            key={item.href.split('?')[0]}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
              active
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-950/20'
                : 'text-(--color-sidebar-muted) hover:bg-(--color-surface-hover) hover:text-(--color-text)'
            }`}
          >
            <span
              className={active ? 'text-white' : 'text-(--color-muted) group-hover:text-sky-500'}
            >
              {item.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav aria-label="Section navigation" className="space-y-5 px-3 pb-5">
      {groups.map((group) =>
        group.collapsible ? (
          <details key={group.title} open className="group/navigation">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-(--color-muted) hover:text-(--color-text)">
              {group.title}
              <ChevronDown size={14} className="transition group-open/navigation:rotate-180" />
            </summary>
            {items(group)}
          </details>
        ) : (
          <section key={group.title}>
            <h2 className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-(--color-muted)">
              {group.title}
            </h2>
            {items(group)}
          </section>
        ),
      )}
    </nav>
  );
}

export default function SectionShell({
  title,
  description,
  groups,
  children,
  backHref,
  backLabel = 'Back to home',
}: SectionShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentItem = groups
    .flatMap((group) => group.items)
    .find((item) => pathname === item.href.split('?')[0]);

  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [drawerOpen]);

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col bg-(--color-sidebar) text-(--color-text)">
      <div className="px-5 pb-5 pt-6">
        {backHref && (
          <Link
            href={backHref}
            className="mb-5 flex w-fit items-center gap-2 rounded-lg text-sm font-medium text-(--color-sidebar-muted) transition hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        <p className="mt-1 text-xl font-bold tracking-tight">{title}</p>
        <p className="mt-2 text-xs leading-5 text-(--color-sidebar-muted)">{description}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Navigation groups={groups} onNavigate={() => setDrawerOpen(false)} />
      </div>
      <div className="border-t border-(--color-divider) p-3">
        <ThemeModeControl />
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 bg-(--color-background)">
      <aside className="hidden h-full w-64 shrink-0 border-r border-(--color-divider) lg:block">
        {sidebar}
      </aside>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onMouseDown={(event) => event.target === event.currentTarget && setDrawerOpen(false)}
        >
          <aside className="h-full w-[min(20rem,86vw)] shadow-2xl">{sidebar}</aside>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-(--color-divider) bg-(--color-paper) px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--color-divider) text-(--color-muted) transition hover:bg-(--color-surface-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 lg:hidden"
              aria-label="Open reports navigation"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-(--color-text) sm:text-2xl">
                {currentItem?.label || title}
              </h1>
              <p className="mt-0.5 hidden text-sm text-(--color-muted) sm:block">
                {currentItem?.description || description}
              </p>
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}

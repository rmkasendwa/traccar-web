'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';

type FloatingPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: (props: Record<string, any>, ref: (node: HTMLElement | null) => void) => ReactNode;
  children: ReactNode;
  placement?: any;
  className?: string;
};

export default function FloatingPanel({
  open,
  onOpenChange,
  trigger,
  children,
  placement = 'bottom-end',
  className = '',
}: FloatingPanelProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const floatingProps = getFloatingProps({
    onKeyDown(event: KeyboardEvent<HTMLElement>) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const items = Array.from(
        event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!items.length) return;
      event.preventDefault();
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? direction > 0
            ? 0
            : items.length - 1
          : (currentIndex + direction + items.length) % items.length;
      items[nextIndex].focus();
    },
  });

  return (
    <>
      {trigger(getReferenceProps(), refs.setReference)}
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={`z-[100] overflow-auto rounded-xl border border-(--color-divider) bg-(--color-paper) p-2 text-(--color-text) shadow-2xl outline-none ${className}`}
              {...floatingProps}
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

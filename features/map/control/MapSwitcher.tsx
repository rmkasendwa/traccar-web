'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { Check, Layers } from 'lucide-react';
import { useTheme } from '@/components/ui';
import { map } from '@/features/map/core/MapView';

type MapSwitcherProps = {
  styles: any[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const focusNextItem = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
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
};

const MapSwitcher = ({ styles, selectedId, onSelect }: MapSwitcherProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: theme.direction === 'rtl' ? 'bottom-start' : 'bottom-end',
    strategy: 'fixed',
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
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  useEffect(() => {
    let element: HTMLDivElement;
    let button: HTMLButtonElement;
    let iconRoot: ReturnType<typeof createRoot>;

    const control = {
      onAdd: () => {
        element = document.createElement('div');
        element.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        button = document.createElement('button');
        button.type = 'button';
        button.title = 'Map style';
        button.setAttribute('aria-label', 'Choose map style');
        button.setAttribute('aria-haspopup', 'menu');
        button.className = 'maplibregl-ctrl-icon flex items-center justify-center text-slate-700';
        button.onclick = () => setOpen((current) => !current);
        element.appendChild(button);
        refs.setReference(button);
        iconRoot = createRoot(button);
        iconRoot.render(<Layers size={18} />);
        return element;
      },
      onRemove: () => {
        refs.setReference(null);
        queueMicrotask(() => iconRoot.unmount());
        element.remove();
      },
    };

    map.addControl(control, theme.direction === 'rtl' ? 'top-left' : 'top-right');
    return () => {
      map.removeControl(control);
    };
  }, [refs, theme.direction]);

  useEffect(() => {
    const reference = refs.domReference.current;
    reference?.setAttribute('aria-expanded', String(open));
  }, [open, refs.domReference]);

  return open ? (
    <FloatingPortal>
      <FloatingFocusManager context={context} initialFocus={0} modal={false}>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-100 w-52 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-slate-950/95 p-1.5 text-white shadow-2xl shadow-slate-950/25 outline-none backdrop-blur"
          {...getFloatingProps({ onKeyDown: focusNextItem })}
        >
          <p className="px-3 pb-1.5 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Map style
          </p>
          {styles.map((style) => {
            const selected = style.id === selectedId;
            return (
              <button
                key={style.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  onSelect(style.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selected ? 'bg-sky-500 text-white' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{style.title}</span>
                {selected && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  ) : null;
};

export default MapSwitcher;

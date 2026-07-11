'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { useDispatch, useSelector } from 'react-redux';
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
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useCatch } from '@/lib/react';
import { useAttributePreference } from '@/lib/preferences';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { map } from '@/features/map/core/MapView';
import useMapOverlays from '@/features/map/overlay/useMapOverlays';
import { sessionActions } from '@/store';

const parseSelectedMapOverlays = (value: unknown) =>
  Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .filter(Boolean);

const focusNextItem = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'),
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

const MapOverlaySwitcher = () => {
  const theme = useTheme();
  const t = useTranslation();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const user = useSelector((state: any) => state.session.user);
  const mapOverlays = useMapOverlays();
  const selectedMapOverlay = useAttributePreference('selectedMapOverlay');
  const selectedMapOverlays = useMemo(
    () => parseSelectedMapOverlays(selectedMapOverlay),
    [selectedMapOverlay],
  );
  const overlays = useMemo(() => mapOverlays.filter((overlay) => overlay.available), [mapOverlays]);

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

  const toggleOverlay = useCatch(async (overlayId: string) => {
    if (!user || saving) return;

    setSaving(true);
    try {
      const enabled = selectedMapOverlays.includes(overlayId);
      const nextMapOverlays = enabled
        ? selectedMapOverlays.filter((id) => id !== overlayId)
        : [...selectedMapOverlays, overlayId];
      const response = await fetchOrThrow(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user,
          attributes: {
            ...user.attributes,
            selectedMapOverlay: nextMapOverlays.join(','),
          },
        }),
      });
      dispatch(sessionActions.updateUser(await response.json()));
    } finally {
      setSaving(false);
    }
  });

  useEffect(() => {
    if (!overlays.length) return undefined;

    let element: HTMLDivElement;
    let button: HTMLButtonElement;
    let iconRoot: ReturnType<typeof createRoot>;

    const control = {
      onAdd: () => {
        element = document.createElement('div');
        element.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        button = document.createElement('button');
        button.type = 'button';
        button.title = t('mapOverlay');
        button.setAttribute('aria-label', t('mapOverlay'));
        button.setAttribute('aria-haspopup', 'menu');
        button.className = 'maplibregl-ctrl-icon map-tool-control map-overlay-control';
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
  }, [overlays.length, refs, t, theme.direction]);

  useEffect(() => {
    const reference = refs.domReference.current;
    reference?.setAttribute('aria-expanded', String(open));
  }, [open, refs.domReference]);

  useEffect(() => {
    refs.domReference.current?.classList.toggle('active', selectedMapOverlays.length > 0);
  }, [refs.domReference, selectedMapOverlays.length]);

  if (!open || !overlays.length) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} initialFocus={0} modal={false}>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-100 w-64 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-slate-950/95 p-1.5 text-white shadow-2xl shadow-slate-950/25 outline-none backdrop-blur"
          {...getFloatingProps({ onKeyDown: focusNextItem })}
        >
          <p className="px-3 pb-1.5 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {t('mapOverlay')}
          </p>
          {overlays.map((overlay) => {
            const selected = selectedMapOverlays.includes(overlay.id);
            return (
              <button
                key={overlay.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={selected}
                disabled={saving}
                onClick={() => toggleOverlay(overlay.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition disabled:cursor-wait disabled:opacity-70 ${
                  selected ? 'bg-sky-500 text-white' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{overlay.title}</span>
                {selected && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
};

export default MapOverlaySwitcher;

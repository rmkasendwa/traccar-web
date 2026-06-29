'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { useTheme } from '@/components/ui';
import { useAttributePreference } from '@/lib/preferences';
import { map } from '@/features/map/core/MapView';
import { toMapCoordinates } from '@/features/map/core/mapUtil';
import { fitBoundsWithCameraMaxZoom } from '@/features/map/core/mapCamera';
import { errorsActions } from '@/store';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const MapGeocoder = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const t = useTranslation();
  const maxZoom = useAttributePreference('web.maxZoom');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmedQuery)}&format=geojson&addressdetails=1`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        setResults(data.features || []);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          dispatch(errorsActions.push(error.message));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, dispatch]);

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
        button.title = t('sharedSearch');
        button.setAttribute('aria-label', t('sharedSearch'));
        button.setAttribute('aria-haspopup', 'dialog');
        button.className = 'maplibregl-ctrl-icon map-tool-control';
        button.onclick = () => setOpen((current) => !current);
        element.appendChild(button);
        refs.setReference(button);
        iconRoot = createRoot(button);
        iconRoot.render(<Search size={18} />);
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
  }, [refs, t, theme.direction]);

  useEffect(() => {
    refs.domReference.current?.setAttribute('aria-expanded', String(open));
  }, [open, refs.domReference]);

  const selectResult = (feature: any) => {
    const [minX, minY, maxX, maxY] = feature.bbox;
    fitBoundsWithCameraMaxZoom(
      [toMapCoordinates(minX, minY), toMapCoordinates(maxX, maxY)] as [
        [number, number],
        [number, number],
      ],
      { padding: 40 },
      maxZoom,
    );
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return open ? (
    <FloatingPortal>
      <FloatingFocusManager context={context} initialFocus={0} modal={false}>
        <section
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-100 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/98 text-slate-900 shadow-2xl shadow-slate-950/20 outline-none backdrop-blur"
          aria-label="Search map"
          {...getFloatingProps()}
        >
          <div className="flex items-center gap-2 border-b border-slate-100 p-2.5">
            <Search size={17} className="ml-1 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('sharedSearch')}
              className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              aria-label={t('sharedSearch')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                <LoaderCircle size={18} className="animate-spin" /> Searching map…
              </div>
            ) : results.length ? (
              results.map((feature) => (
                <button
                  key={feature.properties.place_id}
                  type="button"
                  onClick={() => selectResult(feature)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-100"
                >
                  <MapPin size={17} className="mt-0.5 shrink-0 text-sky-600" />
                  <span className="line-clamp-2 leading-5">{feature.properties.display_name}</span>
                </button>
              ))
            ) : query.trim() ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No places found</p>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">Find a place</p>
                <p className="mt-1 text-xs text-slate-400">Search by address, landmark, or city</p>
              </div>
            )}
          </div>
        </section>
      </FloatingFocusManager>
    </FloatingPortal>
  ) : null;
};

export default MapGeocoder;

'use client';

import { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import MapView from '@/features/map/core/MapView';
import MapCurrentLocation from '@/features/map/MapCurrentLocation';
import MapRoutePath from '@/features/map/MapRoutePath';
import MapRoutePoints from '@/features/map/MapRoutePoints';
import MapCamera from '@/features/map/MapCamera';
import MapGeofence from '@/features/map/MapGeofence';
import MapScale from '@/features/map/MapScale';
import MapPadding from '@/features/map/MapPadding';
import MapOverlay from '@/features/map/overlay/MapOverlay';
import MapOverlaySwitcher from '@/features/map/control/MapOverlaySwitcher';
import { map } from '@/features/map/core/MapView';
import { toMapCoordinates } from '@/features/map/core/mapUtil';
import { useMediaQuery, useTheme } from '@/components/ui';
import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';
import type { ReplayPosition } from '@/features/replay/types';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

type ReplayMapProps = {
  positions: ReplayPosition[];
  currentPosition?: ReplayPosition;
  playing: boolean;
  playbackSpeed: number;
  followEnabled: boolean;
  headingUpEnabled: boolean;
  perspectiveEnabled: boolean;
  onFollowChange: (enabled: boolean) => void;
  onSelectPosition: (index: number) => void;
};

const REPLAY_MIN_ZOOM = 2;
const REPLAY_MAX_ZOOM = 20;
const REPLAY_PERSPECTIVE_PITCH = 58;
const REPLAY_MARKER_STYLES = {
  arrow: {
    image: 'replayMarker',
    size: 0.85,
  },
  car: {
    image: 'car-success',
    size: 0.75,
  },
} as const;
const REPLAY_MARKER_STYLE_KEY: keyof typeof REPLAY_MARKER_STYLES = 'arrow';

function ReplayCameraControls({
  currentPosition,
  playing,
  playbackSpeed,
  followEnabled,
  headingUpEnabled,
  perspectiveEnabled,
  onFollowChange,
}: Pick<
  ReplayMapProps,
  | 'currentPosition'
  | 'playing'
  | 'playbackSpeed'
  | 'followEnabled'
  | 'headingUpEnabled'
  | 'perspectiveEnabled'
  | 'onFollowChange'
>) {
  const t = useTranslation();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    const stopFollowingOnPan = () => onFollowChange(false);
    map.on('zoom', updateZoom);
    map.on('dragstart', stopFollowingOnPan);
    updateZoom();
    return () => {
      map.off('zoom', updateZoom);
      map.off('dragstart', stopFollowingOnPan);
    };
  }, [onFollowChange]);

  useEffect(() => {
    if (!currentPosition) {
      if (perspectiveEnabled || headingUpEnabled) {
        map.easeTo({ bearing: 0, pitch: 0, duration: 250 });
      }
      return;
    }
    const center = toMapCoordinates(currentPosition.longitude, currentPosition.latitude) as [
      number,
      number,
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.easeTo({
      ...(followEnabled ? { center } : {}),
      ...(followEnabled ? { bearing: headingUpEnabled ? currentPosition.course : 0 } : {}),
      pitch: followEnabled && perspectiveEnabled && playing ? REPLAY_PERSPECTIVE_PITCH : 0,
      duration: reduceMotion ? 0 : playing ? 600 / playbackSpeed : 250,
      easing: playing ? (value) => value : (value) => value * (2 - value),
    });
  }, [
    currentPosition,
    followEnabled,
    headingUpEnabled,
    perspectiveEnabled,
    playbackSpeed,
    playing,
  ]);

  useEffect(
    () => () => {
      map.easeTo({ bearing: 0, pitch: 0, duration: 0 });
    },
    [],
  );

  const changeZoom = (change: number) => {
    const minimum = Math.max(REPLAY_MIN_ZOOM, map.getMinZoom());
    const maximum = Math.min(REPLAY_MAX_ZOOM, map.getMaxZoom());
    map.zoomTo(Math.max(minimum, Math.min(maximum, map.getZoom() + change)), { duration: 150 });
  };

  return (
    <div className="absolute right-3 bottom-8 z-10 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200">
      <button
        type="button"
        onClick={() => changeZoom(-1)}
        disabled={zoom <= Math.max(REPLAY_MIN_ZOOM, map.getMinZoom())}
        className="grid h-11 w-11 place-items-center hover:bg-slate-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-35 dark:hover:bg-slate-800"
        aria-label={t('replayZoomOut')}
        title={t('replayZoomOut')}
      >
        <Minus size={18} aria-hidden="true" />
      </button>
      <output
        className="min-w-10 text-center text-[11px] font-bold tabular-nums"
        aria-live="polite"
      >
        {zoom.toFixed(1)}
      </output>
      <button
        type="button"
        onClick={() => changeZoom(1)}
        disabled={zoom >= Math.min(REPLAY_MAX_ZOOM, map.getMaxZoom())}
        className="grid h-11 w-11 place-items-center hover:bg-slate-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-35 dark:hover:bg-slate-800"
        aria-label={t('replayZoomIn')}
        title={t('replayZoomIn')}
      >
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

function ReplayPositionMarker({
  position,
  playing,
  playbackSpeed,
  onClick,
}: {
  position: ReplayPosition;
  playing: boolean;
  playbackSpeed: number;
  onClick: () => void;
}) {
  const id = useId();
  const animationRef = useRef<number | null>(null);
  const coordinateRef = useRef<[number, number] | null>(null);

  const updatePosition = useCallback(
    (coordinates: [number, number]) => {
      coordinateRef.current = coordinates;
      const source = map.getSource(id) as { setData?: (data: object) => void } | undefined;
      source?.setData?.({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates },
            properties: {
              rotation: position.course,
            },
          },
        ],
      });
    },
    [id, position.course],
  );

  useEffect(() => {
    const handleMouseEnter = () => (map.getCanvas().style.cursor = 'pointer');
    const handleMouseLeave = () => (map.getCanvas().style.cursor = '');
    const handleClick = (event: { preventDefault: () => void }) => {
      event.preventDefault();
      onClick();
    };
    const markerStyle = REPLAY_MARKER_STYLES[REPLAY_MARKER_STYLE_KEY];

    map.addSource(id, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id,
      type: 'symbol',
      source: id,
      layout: {
        'icon-image': markerStyle.image,
        'icon-size': markerStyle.size,
        'icon-rotate': ['get', 'rotation'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
    map.on('mouseenter', id, handleMouseEnter);
    map.on('mouseleave', id, handleMouseLeave);
    map.on('click', id, handleClick);

    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      map.off('mouseenter', id, handleMouseEnter);
      map.off('mouseleave', id, handleMouseLeave);
      map.off('click', id, handleClick);
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [id, onClick]);

  useEffect(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);

    const target = toMapCoordinates(position.longitude, position.latitude) as [number, number];
    const start = coordinateRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!playing || !start || reduceMotion) {
      updatePosition(target);
      return undefined;
    }

    const startedAt = performance.now();
    const duration = 600 / playbackSpeed;
    let longitudeDelta = target[0] - start[0];
    if (longitudeDelta > 180) longitudeDelta -= 360;
    if (longitudeDelta < -180) longitudeDelta += 360;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      updatePosition([
        start[0] + longitudeDelta * progress,
        start[1] + (target[1] - start[1]) * progress,
      ]);
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
      else animationRef.current = null;
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [playbackSpeed, playing, position, updatePosition]);

  return null;
}

function ReplayMap({
  positions,
  currentPosition,
  playing,
  playbackSpeed,
  followEnabled,
  headingUpEnabled,
  perspectiveEnabled,
  onFollowChange,
  onSelectPosition,
}: ReplayMapProps) {
  const t = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mapVisible, setMapVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const handlePointClick = useCallback(
    (_id: number, index: number) => onSelectPosition(index),
    [onSelectPosition],
  );
  const handleMarkerClick = useCallback(() => setShowDetails(true), []);

  useEffect(() => {
    const revealMap = () => setMapVisible(true);
    map.on('idle', revealMap);
    if (map.loaded()) revealMap();
    return () => {
      map.off('idle', revealMap);
    };
  }, []);

  return (
    <div className="relative h-full min-h-76 overflow-hidden bg-slate-200">
      <MapView>
        <MapPadding start={desktop ? 376 : 0} />
        <MapOverlay />
        <MapOverlaySwitcher />
        <MapGeofence />
        {positions.length > 0 && (
          <>
            <MapRoutePath positions={positions} />
            <MapRoutePoints positions={positions} onClick={handlePointClick} showSpeedControl />
          </>
        )}
        {currentPosition && (
          <ReplayPositionMarker
            position={currentPosition}
            playing={playing}
            playbackSpeed={playbackSpeed}
            onClick={handleMarkerClick}
          />
        )}
      </MapView>
      <ReplayMapPlaceholder
        className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 motion-reduce:transition-none ${mapVisible ? 'opacity-0' : 'opacity-100'}`}
      />
      <MapScale />
      <MapCurrentLocation />
      <ReplayCameraControls
        currentPosition={currentPosition}
        playing={playing}
        playbackSpeed={playbackSpeed}
        followEnabled={followEnabled}
        headingUpEnabled={headingUpEnabled}
        perspectiveEnabled={perspectiveEnabled}
        onFollowChange={onFollowChange}
      />
      {positions.length > 0 && (
        <MapCamera
          latitude={undefined}
          longitude={undefined}
          positions={positions}
          coordinates={undefined}
        />
      )}
      {showDetails && currentPosition && (
        <div className="absolute bottom-4 left-4 z-10 max-w-[calc(100%-2rem)] rounded-xl border border-white/70 bg-white/95 p-3 text-xs shadow-xl backdrop-blur">
          <div className="flex items-start gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                {new Date(currentPosition.fixTime).toLocaleString()}
              </p>
              <p className="mt-1 text-slate-600">
                {currentPosition.address ||
                  `${currentPosition.latitude.toFixed(5)}, ${currentPosition.longitude.toFixed(5)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="rounded-md px-2 py-1 font-semibold text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              aria-label={t('positionCloseDetails')}
            >
              {t('sharedClose')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ReplayMap);

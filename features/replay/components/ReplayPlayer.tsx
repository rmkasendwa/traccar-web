'use client';

import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';
import ReplayTimeline from '@/features/replay/components/ReplayTimeline';
import type { ReplayPosition } from '@/features/replay/types';
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
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {
  Box,
  Check,
  CircleGauge,
  Compass,
  LocateFixed,
  Pause,
  Play,
  Settings2,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const ReplayMapLoading = () => {
  const t = useTranslation();
  return (
    <div className="h-full" aria-label={t('replayLoadingMap')}>
      <ReplayMapPlaceholder />
    </div>
  );
};

const ReplayMap = dynamic(() => import('@/features/replay/components/ReplayMap'), {
  ssr: false,
  loading: ReplayMapLoading,
});

type ReplayState = {
  positions: ReplayPosition[];
  index: number;
  playing: boolean;
  speed: number;
  followEnabled: boolean;
  headingUpEnabled: boolean;
  perspectiveEnabled: boolean;
  lastIndex: number;
  currentPosition?: ReplayPosition;
  selectPosition: (nextIndex: number) => void;
  togglePlayback: () => void;
  setSpeed: (value: number) => void;
  setFollowEnabled: (value: boolean) => void;
  setHeadingUpEnabled: (value: boolean) => void;
  setPerspectiveEnabled: (value: boolean) => void;
};

const ReplayContext = createContext<ReplayState | null>(null);

export const useReplayState = () => {
  const context = useContext(ReplayContext);
  if (!context) {
    throw new Error('useReplayState must be used within ReplayProvider');
  }
  return context;
};

type ReplayProviderProps = {
  positions: ReplayPosition[];
  children: ReactNode;
};

const speeds = [0.5, 1, 2, 4];

const formatReplayDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function ControlTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const hover = useHover(context, { move: false, delay: { open: 250, close: 80 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <span ref={refs.setReference} className="relative shrink-0" {...getReferenceProps()}>
      {children}
      {open && (
        <FloatingPortal>
          <span
            ref={refs.setFloating}
            style={floatingStyles}
            className="pointer-events-none z-100 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
            {...getFloatingProps()}
          >
            {label}
          </span>
        </FloatingPortal>
      )}
    </span>
  );
}

export function ReplayProvider({ positions, children }: ReplayProviderProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [followEnabled, setFollowEnabled] = useState(false);
  const [headingUpEnabled, setHeadingUpEnabled] = useState(false);
  const [perspectiveEnabled, setPerspectiveEnabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIndex = useMemo(() => Math.max(positions.length - 1, 0), [positions.length]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    stopTimer();
    if (!playing) return undefined;

    timerRef.current = setInterval(() => {
      setIndex((current) => {
        if (current >= lastIndex) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 600 / speed);

    return stopTimer;
  }, [lastIndex, playing, speed, stopTimer]);

  const selectPosition = useCallback(
    (nextIndex: number) => setIndex(Math.max(0, Math.min(lastIndex, nextIndex))),
    [lastIndex],
  );

  const togglePlayback = useCallback(() => {
    setIndex((current) => (current === lastIndex ? 0 : current));
    setPlaying((current) => !current);
  }, [lastIndex]);

  const currentPosition = positions[index];

  return (
    <ReplayContext.Provider
      value={{
        positions,
        index,
        playing,
        speed,
        followEnabled,
        headingUpEnabled,
        perspectiveEnabled,
        lastIndex,
        currentPosition,
        selectPosition,
        togglePlayback,
        setSpeed,
        setFollowEnabled,
        setHeadingUpEnabled,
        setPerspectiveEnabled,
      }}
    >
      {children}
    </ReplayContext.Provider>
  );
}

export function ReplayMapView() {
  const {
    positions,
    currentPosition,
    playing,
    speed,
    followEnabled,
    headingUpEnabled,
    perspectiveEnabled,
    selectPosition,
    setFollowEnabled,
    setHeadingUpEnabled,
    setPerspectiveEnabled,
  } = useReplayState();
  const handleFollowChange = useCallback(
    (value: boolean) => {
      setFollowEnabled(value);
      if (!value) {
        setHeadingUpEnabled(false);
        setPerspectiveEnabled(false);
      }
    },
    [setFollowEnabled, setHeadingUpEnabled, setPerspectiveEnabled],
  );

  return (
    <div className="relative h-full min-h-96 overflow-hidden bg-slate-200">
      <ReplayMap
        positions={positions}
        currentPosition={currentPosition}
        playing={playing}
        playbackSpeed={speed}
        followEnabled={followEnabled}
        headingUpEnabled={headingUpEnabled}
        perspectiveEnabled={perspectiveEnabled}
        onFollowChange={handleFollowChange}
        onSelectPosition={selectPosition}
      />
    </div>
  );
}

export function ReplayMaxSpeedCard({ maxSpeedKph }: { maxSpeedKph: number }) {
  const t = useTranslation();
  const { positions, selectPosition } = useReplayState();
  const maxSpeedIndex = useMemo(
    () =>
      positions.reduce(
        (maximumIndex, position, positionIndex) =>
          (position.speed || 0) > (positions[maximumIndex]?.speed || 0)
            ? positionIndex
            : maximumIndex,
        0,
      ),
    [positions],
  );
  const value = `${maxSpeedKph.toFixed(0)} km/h`;

  return (
    <button
      type="button"
      onClick={() => selectPosition(maxSpeedIndex)}
      className="rounded-xl border border-(--color-divider) bg-(--color-surface-subtle) p-3 text-left transition hover:border-sky-300 hover:bg-(--color-surface-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      aria-label={`${t('replayMaxSpeed')}: ${value}`}
    >
      <span className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-(--color-muted)">
        <CircleGauge size={13} className="text-sky-600" aria-hidden="true" />
        {t('replayMaxSpeed')}
      </span>
      <span className="mt-1 block text-base font-bold tracking-tight text-(--color-text)">
        {value}
      </span>
    </button>
  );
}

export function ReplayControls() {
  const t = useTranslation();
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [followOptionsOpen, setFollowOptionsOpen] = useState(false);
  const {
    positions,
    index,
    currentPosition,
    lastIndex,
    playing,
    speed,
    followEnabled,
    headingUpEnabled,
    perspectiveEnabled,
    selectPosition,
    togglePlayback,
    setSpeed,
    setFollowEnabled,
    setHeadingUpEnabled,
    setPerspectiveEnabled,
  } = useReplayState();
  const {
    refs: followOptionsRefs,
    floatingStyles: followOptionsStyles,
    context: followOptionsContext,
  } = useFloating({
    open: followEnabled && followOptionsOpen,
    onOpenChange: setFollowOptionsOpen,
    placement: 'bottom-start',
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
  const followOptionsDismiss = useDismiss(followOptionsContext);
  const followOptionsRole = useRole(followOptionsContext, { role: 'menu' });
  const {
    getReferenceProps: getFollowOptionsReferenceProps,
    getFloatingProps: getFollowOptionsFloatingProps,
  } = useInteractions([followOptionsDismiss, followOptionsRole]);

  const {
    refs: speedRefs,
    floatingStyles: speedStyles,
    context: speedContext,
  } = useFloating({
    open: speedMenuOpen,
    onOpenChange: setSpeedMenuOpen,
    placement: 'top-end',
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
  const speedDismiss = useDismiss(speedContext);
  const speedRole = useRole(speedContext, { role: 'menu' });
  const { getReferenceProps: getSpeedReferenceProps, getFloatingProps: getSpeedFloatingProps } =
    useInteractions([speedDismiss, speedRole]);

  useEffect(() => {
    if (!followEnabled) {
      setFollowOptionsOpen(false);
    }
  }, [followEnabled]);

  if (!currentPosition) {
    return null;
  }

  const startTime = new Date(positions[0].fixTime).getTime();
  const elapsedTime = new Date(currentPosition.fixTime).getTime() - startTime;
  const totalTime = new Date(positions[lastIndex].fixTime).getTime() - startTime;
  const elapsedLabel = formatReplayDuration(elapsedTime);
  const totalLabel = formatReplayDuration(totalTime);
  const timeColumnWidth = `${Math.ceil(Math.max(totalLabel.length, 4) / 1.5)}ch`;
  const playbackLabel = playing ? t('replayPause') : t('replayPlay');

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        <time dateTime={currentPosition.fixTime} className="tabular-nums" suppressHydrationWarning>
          {new Date(currentPosition.fixTime).toLocaleString()}
        </time>
        <span aria-live="polite" className="tabular-nums">
          {index + 1} / {positions.length}
        </span>
      </div>

      <div className="mt-2 rounded-2xl border border-slate-200/80 bg-slate-50/85 px-2.5 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/85 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="relative flex h-12 items-center justify-center">
          <div className="absolute top-2 left-0 flex items-center gap-1 border-r border-slate-200 pr-2 dark:border-slate-700">
            <div className="relative">
              <ControlTooltip
                label={followEnabled ? t('replayStopFollowing') : t('replayFollowPosition')}
              >
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !followEnabled;
                    setFollowEnabled(nextValue);
                    setFollowOptionsOpen(nextValue);
                    if (!nextValue) {
                      setHeadingUpEnabled(false);
                      setPerspectiveEnabled(false);
                    }
                  }}
                  className={`grid h-8 w-8 place-items-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    followEnabled
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                  aria-label={followEnabled ? t('replayStopFollowing') : t('replayFollowPosition')}
                  aria-pressed={followEnabled}
                >
                  <LocateFixed size={16} aria-hidden="true" />
                </button>
              </ControlTooltip>
              {followEnabled && (
                <ControlTooltip label={t('replayFollowOptions')}>
                  <button
                    ref={followOptionsRefs.setReference}
                    type="button"
                    {...getFollowOptionsReferenceProps({
                      onClick: () => setFollowOptionsOpen(!followOptionsOpen),
                    })}
                    className={`ml-1 inline-grid h-8 w-8 place-items-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                      followOptionsOpen || headingUpEnabled || perspectiveEnabled
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                    aria-expanded={followOptionsOpen}
                    aria-label={t('replayFollowOptions')}
                  >
                    <Settings2 size={16} aria-hidden="true" />
                  </button>
                </ControlTooltip>
              )}
              {followEnabled && followOptionsOpen && (
                <FloatingPortal>
                  <FloatingFocusManager context={followOptionsContext} modal={false}>
                    <div
                      ref={followOptionsRefs.setFloating}
                      style={followOptionsStyles}
                      className="z-100 w-44 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-xs font-semibold shadow-2xl shadow-slate-950/20 outline-none dark:border-slate-700 dark:bg-slate-900"
                      aria-label={t('replayFollowOptions')}
                      {...getFollowOptionsFloatingProps()}
                    >
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={headingUpEnabled}
                        onClick={() => setHeadingUpEnabled(!headingUpEnabled)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                          headingUpEnabled
                            ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Compass size={15} aria-hidden="true" />
                        <span>{t('replayHeadingUp')}</span>
                      </button>
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={perspectiveEnabled}
                        onClick={() => setPerspectiveEnabled(!perspectiveEnabled)}
                        className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                          perspectiveEnabled
                            ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Box size={15} aria-hidden="true" />
                        <span>{t('replayPerspectiveView')}</span>
                      </button>
                    </div>
                  </FloatingFocusManager>
                </FloatingPortal>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <ControlTooltip label={t('replayPreviousPosition')}>
              <button
                type="button"
                onClick={() => selectPosition(index - 1)}
                disabled={index === 0 || playing}
                className="grid h-8 w-8 place-items-center text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-500 dark:hover:text-slate-100"
                aria-label={t('replayPreviousPosition')}
              >
                <SkipBack size={17} fill="currentColor" />
              </button>
            </ControlTooltip>
            <ControlTooltip label={playbackLabel}>
              <button
                type="button"
                onClick={togglePlayback}
                className="mx-1 grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white shadow-md transition hover:scale-105 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-sky-400"
                aria-label={playbackLabel}
                aria-pressed={playing}
              >
                {playing ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" className="translate-x-px" />
                )}
              </button>
            </ControlTooltip>
            <ControlTooltip label={t('replayNextPosition')}>
              <button
                type="button"
                onClick={() => selectPosition(index + 1)}
                disabled={index === lastIndex || playing}
                className="grid h-8 w-8 place-items-center text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-500 dark:hover:text-slate-100"
                aria-label={t('replayNextPosition')}
              >
                <SkipForward size={17} fill="currentColor" />
              </button>
            </ControlTooltip>
          </div>

          <div className="absolute top-2 right-0 border-l border-slate-200 pl-2 dark:border-slate-700">
            <button
              ref={speedRefs.setReference}
              type="button"
              {...getSpeedReferenceProps({ onClick: () => setSpeedMenuOpen(!speedMenuOpen) })}
              className="grid h-8 min-w-10 cursor-pointer place-items-center rounded-lg px-2 text-xs font-bold tabular-nums text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-expanded={speedMenuOpen}
              aria-haspopup="menu"
              aria-label={`${t('replayPlaybackSpeed')}: ${speed}×`}
            >
              {speed}×
            </button>
            {speedMenuOpen && (
              <FloatingPortal>
                <FloatingFocusManager context={speedContext} initialFocus={0} modal={false}>
                  <div
                    ref={speedRefs.setFloating}
                    style={speedStyles}
                    className="z-100 w-32 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/20 outline-none dark:border-slate-700 dark:bg-slate-900"
                    aria-label={t('replayPlaybackSpeed')}
                    {...getSpeedFloatingProps()}
                  >
                    {speeds.map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={speed === value}
                        onClick={() => {
                          setSpeed(value);
                          setSpeedMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                          speed === value
                            ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                        aria-label={t('replayPlaybackSpeedValue').replace('{value}', String(value))}
                      >
                        <span>{value}×</span>
                        {speed === value && <Check size={14} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </FloatingFocusManager>
              </FloatingPortal>
            )}
          </div>
        </div>

        <div
          className="mt-1 grid items-center"
          style={{
            gridTemplateColumns: `${timeColumnWidth} minmax(0, 1fr) ${timeColumnWidth}`,
          }}
        >
          <span className="pr-1 text-right text-[10px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">
            {elapsedLabel}
          </span>
          <ReplayTimeline
            value={index}
            max={lastIndex}
            onChange={selectPosition}
            valueText={t('replayPositionValue')
              .replace('{position}', String(index + 1))
              .replace('{total}', String(positions.length))
              .replace('{time}', new Date(currentPosition.fixTime).toLocaleString())}
            getTooltipText={(nextIndex) =>
              formatReplayDuration(new Date(positions[nextIndex].fixTime).getTime() - startTime)
            }
          />
          <span className="pl-1 text-left text-[10px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
            {totalLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

type ReplayPlayerProps = {
  positions: ReplayPosition[];
  children?: ReactNode;
};

export default function ReplayPlayer({ positions, children }: ReplayPlayerProps) {
  return <ReplayProvider positions={positions}>{children ?? <ReplayMapView />}</ReplayProvider>;
}

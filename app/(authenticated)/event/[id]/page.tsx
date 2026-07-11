'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { useDispatch } from 'react-redux';
import {
  AppBar as BaseAppBar,
  IconButton as BaseIconButton,
  Toolbar as BaseToolbar,
  Typography as BaseTypography,
} from '@/components/ui';
import BackIcon from '@/components/ui/BackIcon';
import { makeStyles } from '@/components/ui/styles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { formatNotificationTitle } from '@/lib/formatter';
import { useNavigate, useParams } from '@/lib/router';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { errorsActions, type AppDispatch } from '@/store';
import type { ApiId, Event, Position } from '@/types/traccar';

const AppBar = BaseAppBar as ComponentType<
  PropsWithChildren<{
    className?: string;
    color?: 'inherit';
    position?: 'static';
  }>
>;
const IconButton = BaseIconButton as ComponentType<
  PropsWithChildren<{
    color?: 'inherit';
    edge?: 'start';
    onClick?: () => void;
    sx?: Record<string, unknown>;
  }>
>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren>;
const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    variant?: 'h6';
  }>
>;

type MarkerClickHandler = (positionId?: unknown, deviceId?: unknown) => void;

type EventMapProps = {
  className: string;
  onCardClose: () => void;
  onMarkerClick: MarkerClickHandler;
  position?: Position;
  showCard: boolean;
};

const EventMap = dynamic<EventMapProps>(
  async () => {
    const [
      { default: BaseMapView },
      { default: BaseMapGeofence },
      { default: BaseMapPositions },
      { default: BaseMapCamera },
      { default: BaseMapScale },
      { default: BaseStatusCard },
    ] = await Promise.all([
      import('@/features/map/core/MapView'),
      import('@/features/map/MapGeofence'),
      import('@/features/map/MapPositions'),
      import('@/features/map/MapCamera'),
      import('@/features/map/MapScale'),
      import('@/features/devices/components/StatusCard'),
    ]);

    const MapView = BaseMapView as ComponentType<PropsWithChildren>;
    const MapGeofence = BaseMapGeofence as ComponentType;
    const MapPositions = BaseMapPositions as ComponentType<{
      onMarkerClick?: MarkerClickHandler;
      positions: Position[];
      titleField?: keyof Position;
    }>;
    const MapCamera = BaseMapCamera as ComponentType<{
      latitude: number;
      longitude: number;
    }>;
    const MapScale = BaseMapScale as ComponentType;
    const StatusCard = BaseStatusCard as ComponentType<{
      deviceId: ApiId;
      disableActions?: boolean;
      onClose: () => void;
      position: Position;
    }>;

    return function EventMap({
      className,
      onCardClose,
      onMarkerClick,
      position,
      showCard,
    }: EventMapProps) {
      const latitude = position?.latitude;
      const longitude = position?.longitude;
      const deviceId = position?.deviceId;
      const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
      const hasDevice = typeof deviceId === 'number';

      return (
        <div className={className}>
          <MapView>
            <MapGeofence />
            {position && (
              <MapPositions
                positions={[position]}
                onMarkerClick={onMarkerClick}
                titleField="fixTime"
              />
            )}
          </MapView>
          <MapScale />
          {hasCoordinates && <MapCamera latitude={latitude} longitude={longitude} />}
          {position && hasDevice && showCard && (
            <StatusCard
              deviceId={deviceId}
              position={position}
              onClose={onCardClose}
              disableActions
            />
          )}
        </div>
      );
    };
  },
  { ssr: false },
);

const useStyles = makeStyles()(() => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    zIndex: 1,
  },
  mapContainer: {
    flexGrow: 1,
  },
}));

const getEventTitle = (t: ReturnType<typeof useTranslation>, event: Event) =>
  formatNotificationTitle(
    t,
    {
      type: event.type,
      attributes: {
        alarms: typeof event.attributes?.alarm === 'string' ? event.attributes.alarm : undefined,
      },
    },
    false,
  );

export default function Page() {
  const { classes } = useStyles({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const t = useTranslation();

  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event>();
  const [position, setPosition] = useState<Position>();
  const [showCard, setShowCard] = useState(false);

  const onMarkerClick = useCallback<MarkerClickHandler>((positionId) => {
    setShowCard(Boolean(positionId));
  }, []);

  const onCardClose = useCallback(() => {
    setShowCard(false);
  }, []);

  useEffect(() => {
    if (!id) return undefined;

    const controller = new AbortController();

    fetchOrThrow(`/api/events/${id}`, { signal: controller.signal })
      .then(async (response) => {
        setEvent((await response.json()) as Event);
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        dispatch(errorsActions.push(error instanceof Error ? error.message : String(error)));
      });

    return () => controller.abort();
  }, [dispatch, id]);

  useEffect(() => {
    if (!event?.positionId) return undefined;

    const controller = new AbortController();

    fetchOrThrow(`/api/positions?id=${event.positionId}`, { signal: controller.signal })
      .then(async (response) => {
        const positions = (await response.json()) as Position[];
        setPosition(positions[0]);
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        dispatch(errorsActions.push(error instanceof Error ? error.message : String(error)));
      });

    return () => controller.abort();
  }, [dispatch, event?.positionId]);

  return (
    <div className={classes.root}>
      <AppBar color="inherit" position="static" className={classes.toolbar}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6">{event && getEventTitle(t, event)}</Typography>
        </Toolbar>
      </AppBar>
      <EventMap
        className={classes.mapContainer}
        position={position}
        onMarkerClick={onMarkerClick}
        showCard={showCard}
        onCardClose={onCardClose}
      />
    </div>
  );
}

// @ts-nocheck
import { useCallback, useState } from 'react';

import { Typography, AppBar, Toolbar, IconButton } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useNavigate, useParams } from '@/lib/router';
import { useAsyncTask } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import MapView from '@/features/map/core/MapView';
import MapCamera from '@/features/map/MapCamera';
import MapPositions from '@/features/map/MapPositions';
import MapGeofence from '@/features/map/MapGeofence';
import StatusCard from '@/features/devices/components/StatusCard';
import { formatNotificationTitle } from '@/lib/formatter';
import MapScale from '@/features/map/MapScale';
import BackIcon from '@/components/ui/BackIcon';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

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

const EventPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const { id } = useParams();

  const [event, setEvent] = useState();
  const [position, setPosition] = useState();
  const [showCard, setShowCard] = useState(false);

  const formatType = (event) =>
    formatNotificationTitle(t, {
      type: event.type,
      attributes: {
        alarms: event.attributes.alarm,
      },
    });

  const onMarkerClick = useCallback(
    (positionId) => {
      setShowCard(Boolean(positionId));
    },
    [setShowCard],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (id) {
        const response = await fetchOrThrow(`/api/events/${id}`, { signal });
        setEvent(await response.json());
      }
    },
    [id],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (event && event.positionId) {
        const response = await fetchOrThrow(`/api/positions?id=${event.positionId}`, { signal });
        const positions = await response.json();
        if (positions.length > 0) {
          setPosition(positions[0]);
        }
      }
    },
    [event],
  );

  return (
    <div className={classes.root}>
      <AppBar color="inherit" position="static" className={classes.toolbar}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate('/')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6">{event && formatType(event)}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.mapContainer}>
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
        {position && <MapCamera latitude={position.latitude} longitude={position.longitude} />}
        {position && showCard && (
          <StatusCard
            deviceId={position.deviceId}
            position={position}
            onClose={() => setShowCard(false)}
            disableActions
          />
        )}
      </div>
    </div>
  );
};

export default EventPage;

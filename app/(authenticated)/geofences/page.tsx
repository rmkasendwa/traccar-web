'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useState,
  type ChangeEvent,
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { useDispatch } from 'react-redux';
import {
  Divider as BaseDivider,
  Drawer as BaseDrawer,
  IconButton as BaseIconButton,
  Toolbar as BaseToolbar,
  Tooltip as BaseTooltip,
  Typography as BaseTypography,
  useMediaQuery,
  useTheme,
} from '@/components/ui';
import BackIcon from '@/components/ui/BackIcon';
import { UploadFileIcon } from '@/components/ui/icons';
import { makeStyles } from '@/components/ui/styles';
import GeofencesList from '@/features/geofences/components/GeofencesList';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useNavigate } from '@/lib/router';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { errorsActions, type AppDispatch } from '@/store';
import type { ApiId } from '@/types/traccar';

const Divider = BaseDivider as ComponentType<{ className?: string }>;
const Drawer = BaseDrawer as ComponentType<
  PropsWithChildren<{
    anchor?: 'top' | 'left';
    className?: string;
    slotProps?: { paper?: { className?: string } };
    variant?: 'permanent';
  }>
>;
const IconButton = BaseIconButton as ComponentType<
  PropsWithChildren<{
    component?: 'span';
    edge?: 'start' | 'end';
    onClick?: () => void;
    sx?: Record<string, unknown>;
  }>
>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren>;
const Tooltip = BaseTooltip as ComponentType<PropsWithChildren<{ title: string }>>;
const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    className?: string;
    variant?: 'h6';
  }>
>;

type GeofencesMapProps = {
  className: string;
  selectedGeofenceId?: ApiId;
};

const GeofencesMap = dynamic<GeofencesMapProps>(
  async () => {
    const [
      { default: BaseMapView },
      { default: BaseMapCurrentLocation },
      { default: BaseMapGeofenceEdit },
      { default: BaseMapGeocoder },
      { default: BaseMapScale },
    ] = await Promise.all([
      import('@/features/map/core/MapView'),
      import('@/features/map/MapCurrentLocation'),
      import('@/features/map/draw/MapGeofenceEdit'),
      import('@/features/map/control/MapGeocoder'),
      import('@/features/map/MapScale'),
    ]);

    const MapView = BaseMapView as ComponentType<PropsWithChildren>;
    const MapCurrentLocation = BaseMapCurrentLocation as ComponentType;
    const MapGeofenceEdit = BaseMapGeofenceEdit as ComponentType<{
      selectedGeofenceId?: ApiId;
    }>;
    const MapGeocoder = BaseMapGeocoder as ComponentType;
    const MapScale = BaseMapScale as ComponentType;

    return function GeofencesMap({ className, selectedGeofenceId }: GeofencesMapProps) {
      return (
        <div className={className}>
          <MapView>
            <MapGeofenceEdit selectedGeofenceId={selectedGeofenceId} />
          </MapView>
          <MapScale />
          <MapCurrentLocation />
          <MapGeocoder />
        </div>
      );
    };
  },
  { ssr: false },
);

const useStyles = makeStyles()((theme: ReturnType<typeof useTheme>) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  drawer: {
    zIndex: 1,
  },
  drawerPaper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      width: theme.dimensions.drawerWidthDesktop,
    },
    [theme.breakpoints.down('sm')]: {
      height: theme.dimensions.drawerHeightPhone,
    },
  },
  mapContainer: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  fileInput: {
    display: 'none',
  },
}));

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const readGpxArea = (result: FileReader['result']) => {
  if (typeof result !== 'string') {
    throw new Error('Unable to read GPX file.');
  }

  const xml = new DOMParser().parseFromString(result, 'text/xml');
  const parseError = xml.getElementsByTagName('parsererror')[0];
  const segment = xml.getElementsByTagName('trkseg')[0];
  if (parseError || !segment) {
    throw new Error('Unable to parse GPX track.');
  }

  const coordinates = Array.from(segment.getElementsByTagName('trkpt'))
    .map((point) => {
      const latitude = point.getAttribute('lat');
      const longitude = point.getAttribute('lon');
      return latitude && longitude ? `${latitude} ${longitude}` : null;
    })
    .filter(Boolean)
    .join(', ');

  if (!coordinates) {
    throw new Error('GPX track does not contain coordinates.');
  }

  return `LINESTRING (${coordinates})`;
};

export default function Page() {
  const theme = useTheme();
  const { classes } = useStyles({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const t = useTranslation();

  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<ApiId>();

  const handleFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const [file] = Array.from(event.target.files ?? []);
      event.target.value = '';
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const area = readGpxArea(reader.result);
          const response = await fetchOrThrow('/api/geofences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: t('sharedGeofence'), area }),
          });
          const item = (await response.json()) as { id?: ApiId };
          if (item.id) {
            navigate(`/settings/geofence/${item.id}`);
          }
        } catch (error) {
          dispatch(errorsActions.push(errorMessage(error)));
        }
      };
      reader.onerror = () => {
        dispatch(errorsActions.push(reader.error?.message || 'Unable to read GPX file.'));
      };
      reader.readAsText(file);
    },
    [dispatch, navigate, t],
  );

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Drawer
          className={classes.drawer}
          anchor={isPhone ? 'top' : 'left'}
          variant="permanent"
          slotProps={{ paper: { className: classes.drawerPaper } }}
        >
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t('sharedGeofences')}
            </Typography>
            <label htmlFor="upload-gpx">
              <input
                accept=".gpx"
                id="upload-gpx"
                type="file"
                className={classes.fileInput}
                onChange={handleFile}
              />
              <Tooltip title={t('sharedUpload')}>
                <IconButton edge="end" component="span">
                  <UploadFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </label>
          </Toolbar>
          <Divider />
          <GeofencesList
            selectedGeofenceId={selectedGeofenceId}
            onGeofenceSelected={setSelectedGeofenceId}
          />
        </Drawer>
        <GeofencesMap className={classes.mapContainer} selectedGeofenceId={selectedGeofenceId} />
      </div>
    </div>
  );
}

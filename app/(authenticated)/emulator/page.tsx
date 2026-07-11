'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, type ComponentType, type PropsWithChildren } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Divider as BaseDivider,
  Drawer as BaseDrawer,
  IconButton as BaseIconButton,
  List as BaseList,
  ListItem as BaseListItem,
  Toolbar as BaseToolbar,
  Typography as BaseTypography,
  useMediaQuery,
  useTheme,
} from '@/components/ui';
import BackIcon from '@/components/ui/BackIcon';
import SelectField from '@/components/ui/SelectField';
import { makeStyles } from '@/components/ui/styles';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useNavigate } from '@/lib/router';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { devicesActions, errorsActions, type AppDispatch, type RootState } from '@/store';
import type { ApiId, Device, Position } from '@/types/traccar';

const Divider = BaseDivider as ComponentType<{ className?: string }>;
const Drawer = BaseDrawer as ComponentType<
  PropsWithChildren<{
    anchor?: 'top' | 'left';
    className?: string;
    onClose?: () => void;
    slotProps?: { paper?: { className?: string } };
    variant?: 'permanent';
  }>
>;
const IconButton = BaseIconButton as ComponentType<
  PropsWithChildren<{
    edge?: 'start' | 'end';
    onClick?: () => void;
    sx?: Record<string, unknown>;
  }>
>;
const List = BaseList as ComponentType<PropsWithChildren<{ className?: string }>>;
const ListItem = BaseListItem as ComponentType<PropsWithChildren<{ className?: string }>>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren<{ className?: string }>>;
const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    className?: string;
    variant?: 'h6';
  }>
>;

type MapClickHandler = (latitude: number, longitude: number) => void;

type EmulatorMapProps = {
  className: string;
  positions: Position[];
  onMapClick: MapClickHandler;
};

const EmulatorMap = dynamic<EmulatorMapProps>(
  async () => {
    const [
      { default: BaseMapView },
      { default: BaseMapCurrentLocation },
      { default: BaseMapGeocoder },
      { default: BaseMapPositions },
      { default: BaseMapScale },
    ] = await Promise.all([
      import('@/features/map/core/MapView'),
      import('@/features/map/MapCurrentLocation'),
      import('@/features/map/control/MapGeocoder'),
      import('@/features/map/MapPositions'),
      import('@/features/map/MapScale'),
    ]);

    const MapView = BaseMapView as ComponentType<PropsWithChildren>;
    const MapCurrentLocation = BaseMapCurrentLocation as ComponentType;
    const MapGeocoder = BaseMapGeocoder as ComponentType;
    const MapPositions = BaseMapPositions as ComponentType<{
      onMapClick: MapClickHandler;
      positions: Position[];
      showStatus?: boolean;
    }>;
    const MapScale = BaseMapScale as ComponentType;

    return function EmulatorMap({ className, positions, onMapClick }: EmulatorMapProps) {
      return (
        <div className={className}>
          <MapView>
            <MapPositions positions={positions} onMapClick={onMapClick} showStatus />
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
}));

const selectDevices = (state: RootState) => state.devices.items;
const selectDeviceId = (state: RootState) => state.devices.selectedId;
const selectPositions = (state: RootState) => state.session.positions;

export default function Page() {
  const theme = useTheme();
  const { classes } = useStyles({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const t = useTranslation();

  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  const devices = useSelector<RootState, Record<ApiId, Device>>(
    selectDevices,
    deviceEquality(['id', 'name', 'uniqueId']),
  );
  const deviceId = useSelector<RootState, ApiId | null>(selectDeviceId);
  const positions = useSelector(selectPositions);

  const sortedDevices = useMemo(
    () => Object.values(devices).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
    [devices],
  );

  const handleDeviceChange = useCallback(
    (event: { target: { value: ApiId | null } }) => {
      dispatch(devicesActions.selectId(event.target.value));
    },
    [dispatch],
  );

  const handleMapClick = useCallback<MapClickHandler>(
    async (latitude, longitude) => {
      try {
        if (!deviceId) return;

        const device = devices[deviceId];
        if (!device?.uniqueId) return;

        const params = new URLSearchParams();
        params.append('id', device.uniqueId);
        params.append('lat', latitude.toString());
        params.append('lon', longitude.toString());

        if (window.location.protocol === 'https:') {
          await fetchOrThrow(window.location.origin, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
        } else {
          await fetchOrThrow(`http://${window.location.hostname}:5055?${params.toString()}`, {
            method: 'POST',
            mode: 'no-cors',
          });
        }
      } catch (error) {
        dispatch(errorsActions.push(error instanceof Error ? error.message : String(error)));
      }
    },
    [deviceId, devices, dispatch],
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
              {t('sharedEmulator')}
            </Typography>
          </Toolbar>
          <Divider />
          <List>
            <ListItem>
              <SelectField
                label={t('reportDevice')}
                data={sortedDevices}
                value={deviceId}
                onChange={handleDeviceChange}
                fullWidth
              />
            </ListItem>
          </List>
        </Drawer>
        <EmulatorMap
          className={classes.mapContainer}
          positions={Object.values(positions)}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
}

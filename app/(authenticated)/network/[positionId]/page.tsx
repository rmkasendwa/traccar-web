'use client';

import dynamic from 'next/dynamic';
import { useState, type ComponentType, type PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import {
  Divider as BaseDivider,
  Drawer as BaseDrawer,
  IconButton as BaseIconButton,
  Paper as BasePaper,
  Table as BaseTable,
  TableBody as BaseTableBody,
  TableCell as BaseTableCell,
  TableHead as BaseTableHead,
  TableRow as BaseTableRow,
  Toolbar as BaseToolbar,
  Typography as BaseTypography,
  useMediaQuery,
  useTheme,
} from '@/components/ui';
import BackIcon from '@/components/ui/BackIcon';
import { makeStyles } from '@/components/ui/styles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useAsyncTask } from '@/lib/react';
import { useNavigate, useParams } from '@/lib/router';
import type { RootState } from '@/store';
import type { Position } from '@/types/traccar';

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
    edge?: 'start';
    onClick?: () => void;
    sx?: Record<string, unknown>;
  }>
>;
const Paper = BasePaper as ComponentType<PropsWithChildren<{ className?: string }>>;
const Table = BaseTable as ComponentType<PropsWithChildren>;
const TableHead = BaseTableHead as ComponentType<PropsWithChildren>;
const TableRow = BaseTableRow as ComponentType<PropsWithChildren>;
const TableCell = BaseTableCell as ComponentType<PropsWithChildren>;
const TableBody = BaseTableBody as ComponentType<PropsWithChildren>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren>;
const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    className?: string;
    variant?: 'h6' | 'subtitle1';
  }>
>;

type CellTower = {
  cellId?: number;
  locationAreaCode?: number;
  mobileCountryCode?: number;
  mobileNetworkCode?: number;
};

type WifiAccessPoint = {
  macAddress?: string;
  signalStrength?: number;
};

type PositionNetwork = {
  cellTowers?: CellTower[];
  wifiAccessPoints?: WifiAccessPoint[];
};

type NetworkPosition = Position & {
  network?: PositionNetwork;
};

type NetworkMapProps = {
  className: string;
  positions: Position[];
};

const NetworkMap = dynamic<NetworkMapProps>(
  async () => {
    const [
      { default: BaseMapView },
      { default: BaseMapCamera },
      { default: BaseMapCurrentLocation },
      { default: BaseMapGeocoder },
      { default: BaseMapPositions },
      { default: BaseMapScale },
    ] = await Promise.all([
      import('@/features/map/core/MapView'),
      import('@/features/map/MapCamera'),
      import('@/features/map/MapCurrentLocation'),
      import('@/features/map/control/MapGeocoder'),
      import('@/features/map/MapPositions'),
      import('@/features/map/MapScale'),
    ]);

    const MapView = BaseMapView as ComponentType<PropsWithChildren>;
    const MapCamera = BaseMapCamera as ComponentType<{
      positions?: Position[];
    }>;
    const MapCurrentLocation = BaseMapCurrentLocation as ComponentType;
    const MapGeocoder = BaseMapGeocoder as ComponentType;
    const MapPositions = BaseMapPositions as ComponentType<{
      positions: Position[];
      showStatus?: boolean;
      titleField?: string;
    }>;
    const MapScale = BaseMapScale as ComponentType;

    return function NetworkMap({ className, positions }: NetworkMapProps) {
      return (
        <div className={className}>
          <MapView>
            <MapPositions positions={positions} showStatus titleField="fixTime" />
            <MapCamera positions={positions} />
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
  drawerContent: {
    overflow: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  mapContainer: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  tableSection: {
    overflow: 'hidden',
  },
  tableTitle: {
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)} ${theme.spacing(0.5)}`,
  },
}));

export default function Page() {
  const theme = useTheme();
  const { classes } = useStyles({});
  const navigate = useNavigate();

  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const { positionId } = useParams<{ positionId?: string }>();

  const [item, setItem] = useState<NetworkPosition | null>(null);

  useAsyncTask(
    async ({ signal }: { signal: AbortSignal }) => {
      if (!positionId) {
        setItem(null);
        return;
      }

      const response = await fetchOrThrow(`/api/positions?id=${positionId}`, { signal });
      const positions = (await response.json()) as NetworkPosition[];
      setItem(positions[0] ?? null);
    },
    [positionId],
  );

  const deviceName = useSelector((state: RootState) =>
    item?.deviceId ? state.devices.items[item.deviceId]?.name : null,
  );

  const positions = item ? [item] : [];

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
              {deviceName}
            </Typography>
          </Toolbar>
          <Divider />
          <div className={classes.drawerContent}>
            <Paper className={classes.tableSection}>
              <Typography variant="subtitle1" className={classes.tableTitle}>
                Cell Towers
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>MCC</TableCell>
                    <TableCell>MNC</TableCell>
                    <TableCell>LAC</TableCell>
                    <TableCell>CID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(item?.network?.cellTowers || []).map((cell, index) => (
                    <TableRow key={cell.cellId ?? `${cell.locationAreaCode ?? 'cell'}-${index}`}>
                      <TableCell>{cell.mobileCountryCode}</TableCell>
                      <TableCell>{cell.mobileNetworkCode}</TableCell>
                      <TableCell>{cell.locationAreaCode}</TableCell>
                      <TableCell>{cell.cellId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <Paper className={classes.tableSection}>
              <Typography variant="subtitle1" className={classes.tableTitle}>
                Wi-Fi
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>MAC</TableCell>
                    <TableCell>RSSI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(item?.network?.wifiAccessPoints || []).map((wifi, index) => (
                    <TableRow key={wifi.macAddress ?? `wifi-${index}`}>
                      <TableCell>{wifi.macAddress}</TableCell>
                      <TableCell>{wifi.signalStrength}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </div>
        </Drawer>
        <NetworkMap className={classes.mapContainer} positions={positions} />
      </div>
    </div>
  );
}

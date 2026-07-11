import { useState, type ComponentType, type PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';

import {
  Typography as BaseTypography,
  Container as BaseContainer,
  Paper as BasePaper,
  AppBar as BaseAppBar,
  Toolbar as BaseToolbar,
  IconButton as BaseIconButton,
  Table as BaseTable,
  TableHead as BaseTableHead,
  TableRow as BaseTableRow,
  TableCell as BaseTableCell,
  TableBody as BaseTableBody,
  useTheme,
} from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useNavigate, useParams } from '@/lib/router';
import { useAsyncTask } from '@/lib/react';
import BackIcon from '@/components/ui/BackIcon';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import type { RootState } from '@/store';
import type { Position } from '@/types/traccar';

const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    variant?: 'h6';
  }>
>;
const Container = BaseContainer as ComponentType<
  PropsWithChildren<{
    maxWidth?: 'sm';
  }>
>;
const Paper = BasePaper as ComponentType<PropsWithChildren>;
const AppBar = BaseAppBar as ComponentType<
  PropsWithChildren<{
    color?: 'inherit';
    position?: 'sticky';
  }>
>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren>;
const IconButton = BaseIconButton as ComponentType<
  PropsWithChildren<{
    color?: 'inherit';
    edge?: 'start';
    onClick?: () => void;
    sx?: Record<string, unknown>;
  }>
>;
const Table = BaseTable as ComponentType<PropsWithChildren>;
const TableHead = BaseTableHead as ComponentType<PropsWithChildren>;
const TableRow = BaseTableRow as ComponentType<PropsWithChildren>;
const TableCell = BaseTableCell as ComponentType<PropsWithChildren>;
const TableBody = BaseTableBody as ComponentType<PropsWithChildren>;

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

type NetworkPosition = Omit<Position, 'network'> & {
  network?: PositionNetwork;
};

const useStyles = makeStyles()((theme: ReturnType<typeof useTheme>) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const NetworkPage = () => {
  const { classes } = useStyles({});
  const navigate = useNavigate();

  const { positionId } = useParams<{ positionId?: string }>();

  const [item, setItem] = useState<NetworkPosition | null>(null);

  useAsyncTask(
    async ({ signal }: { signal: AbortSignal }) => {
      if (positionId) {
        const response = await fetchOrThrow(`/api/positions?id=${positionId}`, { signal });
        const positions = (await response.json()) as NetworkPosition[];
        if (positions.length > 0) {
          setItem(positions[0]);
        }
      }
    },
    [positionId],
  );

  const deviceName = useSelector((state: RootState) => {
    if (item?.deviceId) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6">{deviceName}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.content}>
        <Container maxWidth="sm">
          <Paper>
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
        </Container>
        <Container maxWidth="sm">
          <Paper>
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
        </Container>
      </div>
    </div>
  );
};

export default NetworkPage;

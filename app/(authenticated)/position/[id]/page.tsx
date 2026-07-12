'use client';

import { useState, type ComponentType, type PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import {
  AppBar as BaseAppBar,
  Container as BaseContainer,
  IconButton as BaseIconButton,
  Paper as BasePaper,
  Table as BaseTable,
  TableBody as BaseTableBody,
  TableCell as BaseTableCell,
  TableHead as BaseTableHead,
  TableRow as BaseTableRow,
  Toolbar as BaseToolbar,
  Typography as BaseTypography,
  useTheme,
} from '@/components/ui';
import BackIcon from '@/components/ui/BackIcon';
import { makeStyles } from '@/components/ui/styles';
import PositionValue from '@/features/positions/components/PositionValue';
import usePositionAttributes from '@/features/positions/hooks/usePositionAttributes';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useAsyncTask } from '@/lib/react';
import { useNavigate, useParams } from '@/lib/router';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import type { RootState } from '@/store';
import type { Position } from '@/types/traccar';

type PositionAttributeDefinition = {
  name?: string;
};

const AppBar = BaseAppBar as ComponentType<
  PropsWithChildren<{
    color?: 'inherit';
    position?: 'sticky';
  }>
>;
const Container = BaseContainer as ComponentType<
  PropsWithChildren<{
    maxWidth?: 'sm';
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
const Paper = BasePaper as ComponentType<PropsWithChildren>;
const Table = BaseTable as ComponentType<PropsWithChildren>;
const TableHead = BaseTableHead as ComponentType<PropsWithChildren>;
const TableRow = BaseTableRow as ComponentType<PropsWithChildren>;
const TableCell = BaseTableCell as ComponentType<PropsWithChildren>;
const TableBody = BaseTableBody as ComponentType<PropsWithChildren>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren>;
const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    variant?: 'h6';
  }>
>;
const TypedPositionValue = PositionValue as ComponentType<{
  attribute?: string;
  position: Position;
  property?: string;
}>;

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
  },
}));

export default function Page() {
  const { classes } = useStyles({});
  const navigate = useNavigate();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t) as Record<
    string,
    PositionAttributeDefinition
  >;
  const { id } = useParams<{ id?: string }>();

  const [item, setItem] = useState<Position | null>(null);

  useAsyncTask(
    async ({ signal }: { signal: AbortSignal }) => {
      if (!id) {
        setItem(null);
        return;
      }

      const response = await fetchOrThrow(`/api/positions?id=${id}`, { signal });
      const positions = (await response.json()) as Position[];
      setItem(positions[0] ?? null);
    },
    [id],
  );

  const deviceName = useSelector((state: RootState) =>
    item?.deviceId ? state.devices.items[item.deviceId]?.name : null,
  );

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
                  <TableCell>{t('stateName')}</TableCell>
                  <TableCell>{t('sharedName')}</TableCell>
                  <TableCell>{t('stateValue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item &&
                  Object.getOwnPropertyNames(item)
                    .filter((property) => property !== 'attributes')
                    .map((property) => (
                      <TableRow key={property}>
                        <TableCell>{property}</TableCell>
                        <TableCell>
                          <strong>{positionAttributes[property]?.name}</strong>
                        </TableCell>
                        <TableCell>
                          <TypedPositionValue position={item} property={property} />
                        </TableCell>
                      </TableRow>
                    ))}
                {item &&
                  Object.getOwnPropertyNames(item.attributes ?? {}).map((attribute) => (
                    <TableRow key={attribute}>
                      <TableCell>{attribute}</TableCell>
                      <TableCell>
                        <strong>{positionAttributes[attribute]?.name}</strong>
                      </TableCell>
                      <TableCell>
                        <TypedPositionValue position={item} attribute={attribute} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </div>
    </div>
  );
}

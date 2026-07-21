import { Fragment, type ComponentType, type MouseEvent, type PropsWithChildren } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@/components/ui/styles';
import {
  Divider as BaseDivider,
  List as BaseList,
  ListItemButton as BaseListItemButton,
  ListItemText as BaseListItemText,
} from '@/components/ui';

import { geofencesActions, type AppDispatch, type RootState } from '@/store';
import BaseCollectionActions from '@/features/settings/components/CollectionActions';
import { routes } from '@/lib/routes';
import { useCatchCallback } from '@/lib/react';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import type { ApiId, Geofence } from '@/types/traccar';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const CollectionActions = BaseCollectionActions as ComponentType<{
  customActions?: unknown[];
  editPath: string;
  endpoint: string;
  itemId: ApiId;
  onReload: () => void;
  readonly?: boolean;
}>;
const Divider = BaseDivider as ComponentType<{ className?: string }>;
const List = BaseList as ComponentType<
  PropsWithChildren<{
    className?: string;
  }>
>;
const ListItemButton = BaseListItemButton as ComponentType<
  PropsWithChildren<{
    onClick?: () => void;
    selected?: boolean;
  }>
>;
const ListItemText = BaseListItemText as ComponentType<{
  primary?: string;
}>;

type GeofencesListProps = {
  selectedGeofenceId?: ApiId;
  onGeofenceSelected: (geofenceId: ApiId) => void;
};

const useStyles = makeStyles()(() => ({
  list: {
    flexGrow: 1,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  empty: {
    padding: '24px 16px',
  },
}));

const selectGeofences = (state: RootState) => state.geofences.items;
const stopPropagation = (event: MouseEvent) => event.stopPropagation();

const GeofencesList = ({ selectedGeofenceId, onGeofenceSelected }: GeofencesListProps) => {
  const { classes } = useStyles({});
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslation();

  const items = useSelector<RootState, Record<ApiId, Geofence>>(selectGeofences);
  const geofences = Object.values(items).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetchOrThrow('/api/geofences');
    dispatch(geofencesActions.refresh((await response.json()) as Geofence[]));
  }, [dispatch]);

  return (
    <List className={classes.list}>
      {geofences.length === 0 && <div className={classes.empty}>{t('geofenceNoGeofences')}</div>}
      {geofences.map((item, index, list) => (
        <Fragment key={item.id}>
          <ListItemButton
            key={item.id}
            selected={item.id === selectedGeofenceId}
            onClick={() => item.id && onGeofenceSelected(item.id)}
          >
            <ListItemText primary={item.name} />
            {item.id && (
              <div onClick={stopPropagation}>
                <CollectionActions
                  itemId={item.id}
                  editPath={routes.settings.geofence.base}
                  endpoint="geofences"
                  onReload={refreshGeofences}
                />
              </div>
            )}
          </ListItemButton>
          {index < list.length - 1 ? <Divider /> : null}
        </Fragment>
      ))}
    </List>
  );
};

export default GeofencesList;

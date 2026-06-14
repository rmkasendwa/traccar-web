// @ts-nocheck
import { useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableRow, TableCell, TableHead, TableBody, IconButton } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { DeleteIcon } from '@/components/ui/icons';
import { useAsyncTask } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import ReportsMenu from '@/features/reports/components/ReportsMenu';
import TableShimmer from '@/components/ui/TableShimmer';
import RemoveDialog from '@/components/ui/RemoveDialog';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
}));

const ScheduledPage = () => {
  const { classes } = useStyles();
  const t = useTranslation();

  const calendars = useSelector((state) => state.calendars.items);

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState();

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setLoading(true);
      try {
        const response = await fetchOrThrow('/api/reports', { signal });
        setItems(await response.json());
      } finally {
        setLoading(false);
      }
    },
    [reloadKey],
  );

  const formatType = (type) => {
    switch (type) {
      case 'events':
        return t('reportEvents');
      case 'route':
        return t('reportPositions');
      case 'summary':
        return t('reportSummary');
      case 'trips':
        return t('reportTrips');
      case 'stops':
        return t('reportStops');
      default:
        return type;
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportScheduled']}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedType')}</TableCell>
            <TableCell>{t('sharedDescription')}</TableCell>
            <TableCell>{t('sharedCalendar')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatType(item.type)}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{calendars[item.calendarId].name}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <IconButton size="small" onClick={() => setRemovingId(item.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={4} endAction />
          )}
        </TableBody>
      </Table>
      <RemoveDialog
        style={{ transform: 'none' }}
        open={!!removingId}
        endpoint="reports"
        itemId={removingId}
        onResult={(removed) => {
          setRemovingId(null);
          if (removed) {
            reload();
          }
        }}
      />
    </PageLayout>
  );
};

export default ScheduledPage;

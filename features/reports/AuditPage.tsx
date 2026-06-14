// @ts-nocheck
import { useState } from 'react';
import { Table, TableRow, TableCell, TableHead, TableBody } from '@/components/ui';
import { formatTime } from '@/lib/formatter';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import ReportsMenu from '@/features/reports/components/ReportsMenu';
import ReportFilter from '@/features/reports/components/ReportFilter';
import usePersistedState from '@/lib/usePersistedState';
import ColumnSelect from '@/features/reports/components/ColumnSelect';
import { useCatchCallback } from '@/lib/react';
import useReportStyles from '@/features/reports/common/useReportStyles';
import TableShimmer from '@/components/ui/TableShimmer';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const columnsArray = [
  ['actionTime', 'positionServerTime'],
  ['address', 'positionAddress'],
  ['userId', 'settingsUser'],
  ['actionType', 'sharedActionType'],
  ['objectType', 'sharedQbjectType'],
  ['objectId', 'deviceIdentifier'],
];
const columnsMap = new Map(columnsArray);

const AuditPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const [columns, setColumns] = usePersistedState('auditColumns', [
    'actionTime',
    'userId',
    'actionType',
    'objectType',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const onShow = useCatchCallback(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetchOrThrow(`/api/audit?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportAudit']}>
      <div className={classes.header}>
        <ReportFilter onShow={onShow} deviceType="none" loading={loading}>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((key) => (
              <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((key) => (
                  <TableCell key={key}>
                    {key === 'actionTime' ? formatTime(item[key], 'minutes') : item[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={columns.length} />
          )}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default AuditPage;

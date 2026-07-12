// @ts-nocheck
'use client';
import { useCallback, useReducer, useState } from 'react';
import { Table, TableRow, TableCell, TableHead, TableBody } from '@/components/ui';
import { useAsyncTask, useScrollToLoad, pageSize } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import CollectionFab from '@/features/settings/components/CollectionFab';
import CollectionActions from '@/features/settings/components/CollectionActions';
import TableShimmer from '@/components/ui/TableShimmer';
import SearchHeader from '@/features/settings/components/SearchHeader';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import CollectionEmptyState from '@/features/settings/components/CollectionEmptyState';

const DriversPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/drivers?${query.toString()}`, { signal });
      const data = await response.json();
      setItems((previous) => (offset ? [...previous, ...data] : data));
      setHasMore(data.length >= pageSize);
    },
    [searchKeyword],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedDrivers']}>
      <SearchHeader
        keyword={searchKeyword}
        setKeyword={setSearchKeyword}
        editPath="/settings/driver"
        addLabel="Add driver"
      />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('deviceIdentifier')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!hasMore && items.length === 0 && (
            <CollectionEmptyState
              colSpan={3}
              editPath="/settings/driver"
              itemName="drivers"
              searchKeyword={searchKeyword}
            />
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.uniqueId}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/driver"
                  endpoint="drivers"
                  onReload={reload}
                />
              </TableCell>
            </TableRow>
          ))}
          {hasMore && (
            <TableShimmer ref={items.length > 0 ? sentinelRef : null} columns={3} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/driver" />
    </PageLayout>
  );
};

export default DriversPage;

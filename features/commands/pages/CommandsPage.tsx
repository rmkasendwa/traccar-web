// @ts-nocheck
'use client';
import { useCallback, useReducer, useState } from 'react';
import { Table, TableRow, TableCell, TableHead, TableBody } from '@/components/ui';
import { useAsyncTask, useScrollToLoad, pageSize } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { formatBoolean } from '@/lib/formatter';
import { prefixString } from '@/lib/stringUtils';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import CollectionFab from '@/features/settings/components/CollectionFab';
import CollectionActions from '@/features/settings/components/CollectionActions';
import TableShimmer from '@/components/ui/TableShimmer';
import SearchHeader from '@/features/settings/components/SearchHeader';
import { useRestriction } from '@/lib/permissions';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import CollectionEmptyState from '@/features/settings/components/CollectionEmptyState';

const CommandsPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const limitCommands = useRestriction('limitCommands');

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/commands?${query.toString()}`, { signal });
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedSavedCommands']}>
      <SearchHeader
        keyword={searchKeyword}
        setKeyword={setSearchKeyword}
        editPath="/settings/command"
        addLabel="Add command"
        disabled={limitCommands}
      />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedDescription')}</TableCell>
            <TableCell>{t('sharedType')}</TableCell>
            <TableCell>{t('commandSendSms')}</TableCell>
            {!limitCommands && <TableCell className={classes.columnAction} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {!hasMore && items.length === 0 && (
            <CollectionEmptyState
              colSpan={limitCommands ? 3 : 4}
              editPath="/settings/command"
              itemName="saved commands"
              searchKeyword={searchKeyword}
              disabled={limitCommands}
            />
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.description}</TableCell>
              <TableCell>{t(prefixString('command', item.type))}</TableCell>
              <TableCell>{formatBoolean(item.textChannel, t)}</TableCell>
              {!limitCommands && (
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/command"
                    endpoint="commands"
                    onReload={reload}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {hasMore && (
            <TableShimmer
              ref={items.length > 0 ? sentinelRef : null}
              columns={limitCommands ? 3 : 4}
              endAction
            />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/command" disabled={limitCommands} />
    </PageLayout>
  );
};

export default CommandsPage;

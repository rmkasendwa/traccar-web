// @ts-nocheck
'use client';
import { useCallback, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from '@/lib/router';
import { Table, TableRow, TableCell, TableHead, TableBody } from '@/components/ui';
import { LinkIcon } from '@/components/ui/icons';
import { PublishIcon } from '@/components/ui/icons';
import { ShareIcon } from '@/components/ui/icons';
import { useAsyncTask, useScrollToLoad, pageSize } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import CollectionFab from '@/features/settings/components/CollectionFab';
import CollectionActions from '@/features/settings/components/CollectionActions';
import TableShimmer from '@/components/ui/TableShimmer';
import SearchHeader from '@/features/settings/components/SearchHeader';
import { useRestriction } from '@/lib/permissions';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const GroupsPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const limitCommands = useRestriction('limitCommands');
  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);

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
      const response = await fetchOrThrow(`/api/groups?${query.toString()}`, { signal });
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

  const actionCommand = {
    key: 'command',
    title: t('deviceCommand'),
    icon: <PublishIcon fontSize="small" />,
    handler: (groupId) => navigate(`/settings/group/${groupId}/command`),
  };

  const actionShare = {
    key: 'share',
    title: t('sharedShare'),
    icon: <ShareIcon fontSize="small" />,
    handler: (groupId) => navigate(`/settings/group/${groupId}/share`),
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (groupId) => navigate(`/settings/group/${groupId}/connections`),
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsGroups']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/group"
                  endpoint="groups"
                  onReload={reload}
                  customActions={[
                    actionConnections,
                    ...(!limitCommands ? [actionCommand] : []),
                    ...(!shareDisabled && !user.temporary ? [actionShare] : []),
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
          {hasMore && (
            <TableShimmer ref={items.length > 0 ? sentinelRef : null} columns={2} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/group" />
    </PageLayout>
  );
};

export default GroupsPage;

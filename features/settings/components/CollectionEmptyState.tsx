// @ts-nocheck
'use client';

import { Button, TableCell, TableRow } from '@/components/ui';
import { useNavigate } from '@/lib/router';
import { useRestriction } from '@/lib/permissions';
import { Inbox, Plus, SearchX } from 'lucide-react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

type CollectionEmptyStateProps = {
  colSpan: number;
  editPath: string;
  itemName: string;
  searchKeyword?: string;
  disabled?: boolean;
};

export default function CollectionEmptyState({
  colSpan,
  editPath,
  itemName,
  searchKeyword,
  disabled,
}: CollectionEmptyStateProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const readonly = useRestriction('readonly');
  const searching = Boolean(searchKeyword?.trim());
  const canCreate = !readonly && !disabled;
  const singularItemName = itemName.replace(/s$/, '');
  const capitalizedItemName = `${itemName[0].toUpperCase()}${itemName.slice(1)}`;

  return (
    <TableRow className="collection-empty-state">
      <TableCell colSpan={colSpan} className="border-b-0! px-4! py-12! text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div className="mb-4 rounded-full bg-(--color-background) p-3 text-(--color-muted)">
            {searching ? <SearchX size={28} /> : <Inbox size={28} />}
          </div>
          <h2 className="text-base font-semibold text-(--color-text)">
            {searching
              ? t('collectionNoItemsFound').replace('{itemName}', itemName)
              : t('collectionNoItemsYet').replace('{itemName}', itemName)}
          </h2>
          <p className="mt-1 text-sm text-(--color-muted)">
            {searching
              ? t('collectionTryDifferentSearch')
              : canCreate
                ? t('collectionAddFirstItem').replace('{itemName}', singularItemName)
                : t('collectionItemsAppear').replace('{itemName}', capitalizedItemName)}
          </p>
          {!searching && canCreate && (
            <Button
              className="mt-5"
              variant="contained"
              startIcon={<Plus size={17} />}
              onClick={() => navigate(editPath)}
            >
              {t('collectionAddItem').replace('{itemName}', singularItemName)}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

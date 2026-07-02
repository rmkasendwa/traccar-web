// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from '@/lib/router';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Typography,
  TextField,
} from '@/components/ui';
import { useCatch, useAsyncTask } from '@/lib/react';
import PageLayout from '@/components/layout/PageLayout';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import SettingsFormActions from '@/features/settings/components/SettingsFormActions';

const EditItemView = ({
  children,
  endpoint,
  item,
  setItem,
  defaultItem,
  validate,
  onItemSaved,
  menu,
  breadcrumbs,
}) => {
  const navigate = useNavigate();

  const { id } = useParams();
  const initialItem = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (item && initialItem.current === null) {
    initialItem.current = JSON.stringify(item);
  }

  const dirty = !id || (item && JSON.stringify(item) !== initialItem.current);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (dirty && !saving) event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty, saving]);

  useAsyncTask(
    async ({ signal }) => {
      if (!item) {
        if (id) {
          const response = await fetchOrThrow(`/api/${endpoint}/${id}`, { signal });
          setItem(await response.json());
        } else {
          setItem(defaultItem || {});
        }
      }
    },
    [id, item, defaultItem, endpoint, setItem],
  );

  const handleSave = useCatch(async () => {
    setSaving(true);
    setSaved(false);
    try {
      let url = `/api/${endpoint}`;
      if (id) url += `/${id}`;

      const response = await fetchOrThrow(url, {
        method: !id ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (onItemSaved) await onItemSaved(await response.json());
      setSaved(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(-1);
    } finally {
      setSaving(false);
    }
  });

  return (
    <PageLayout bare menu={menu} breadcrumbs={breadcrumbs}>
      <div className="settings-form-layout mx-auto w-full max-w-5xl">
        <SettingsFormActions
          dirty={dirty}
          saving={saving}
          saved={saved}
          valid={Boolean(item && (validate?.() ?? true))}
          onCancel={() => navigate(-1)}
          onSave={handleSave}
        />
        <div className="settings-form-grid">
          {item ? (
            children
          ) : (
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography variant="subtitle1">
                  <Skeleton width="10em" />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={-i} width="100%">
                    <TextField />
                  </Skeleton>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EditItemView;

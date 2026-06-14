// @ts-nocheck
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TextField } from '@/components/ui';

import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@/components/ui';
import { ExpandMoreIcon } from '@/components/ui/icons';
import EditItemView from '@/features/settings/components/EditItemView';
import EditAttributesAccordion from '@/features/attributes/components/EditAttributesAccordion';
import SelectField from '@/components/ui/SelectField';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import useCommonDeviceAttributes from '@/features/devices/hooks/useCommonDeviceAttributes';
import useGroupAttributes from '@/features/groups/hooks/useGroupAttributes';
import { useCatch } from '@/lib/react';
import { groupsActions } from '@/store';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const GroupPage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const groupAttributes = useGroupAttributes(t);

  const [item, setItem] = useState();

  const onItemSaved = useCatch(async () => {
    const response = await fetchOrThrow('/api/groups');
    dispatch(groupsActions.refresh(await response.json()));
  });

  const validate = () => item && item.name;

  return (
    <EditItemView
      endpoint="groups"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'groupDialog']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedExtra')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...groupAttributes }}
          />
        </>
      )}
    </EditItemView>
  );
};

export default GroupPage;

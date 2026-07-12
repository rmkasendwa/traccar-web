// @ts-nocheck
'use client';
import { useState } from 'react';
import { TextField } from '@/components/ui';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@/components/ui';
import { ExpandMoreIcon } from '@/components/ui/icons';
import EditItemView from '@/features/settings/components/EditItemView';
import EditAttributesAccordion from '@/features/attributes/components/EditAttributesAccordion';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';

const DriverPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.name && item.uniqueId;

  return (
    <EditItemView
      endpoint="drivers"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDriver']}
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
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceIdentifier')}
              />
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{}}
          />
        </>
      )}
    </EditItemView>
  );
};

export default DriverPage;

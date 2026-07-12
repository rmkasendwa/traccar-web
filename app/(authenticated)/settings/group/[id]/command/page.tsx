// @ts-nocheck
'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from '@/lib/router';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@/components/ui';
import { ExpandMoreIcon } from '@/components/ui/icons';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import { useCatch } from '@/lib/react';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const CommandDevicePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const textEnabled = useSelector((state) => state.session.server.textEnabled);

  const [item, setItem] = useState({ type: 'custom', attributes: {} });

  const handleSend = useCatch(async () => {
    const query = new URLSearchParams({ groupId: id });
    await fetchOrThrow(`/api/commands/send?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    navigate(-1);
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceCommand']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <FormControl fullWidth>
              <InputLabel>{t('sharedType')}</InputLabel>
              <Select label={t('sharedType')} value="custom" disabled>
                <MenuItem value="custom">{t('commandCustom')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              value={item.attributes.data}
              onChange={(e) =>
                setItem({ ...item, attributes: { ...item.attributes, data: e.target.value } })
              }
              label={t('commandData')}
            />
            {textEnabled && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.textChannel}
                    onChange={(event) => setItem({ ...item, textChannel: event.target.checked })}
                  />
                }
                label={t('commandSendSms')}
              />
            )}
          </AccordionDetails>
        </Accordion>
        <div className={classes.buttons}>
          <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
            {t('sharedCancel')}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="contained"
            onClick={handleSend}
            disabled={!item.attributes.data}
          >
            {t('commandSend')}
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};

export default CommandDevicePage;

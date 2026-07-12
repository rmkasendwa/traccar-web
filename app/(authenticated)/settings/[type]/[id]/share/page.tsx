// @ts-nocheck
'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from '@/lib/router';
import dayjs from 'dayjs';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  TextField,
  Button,
} from '@/components/ui';
import { ExpandMoreIcon } from '@/components/ui/icons';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import { useCatchCallback } from '@/lib/react';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const SharePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { type, id } = useParams();

  const item = useSelector((state) =>
    type === 'group' ? state.groups.items[id] : state.devices.items[id],
  );

  const [expiration, setExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DDTHH:mm'),
  );
  const [link, setLink] = useState();

  const handleShare = useCatchCallback(async () => {
    const expirationTime = dayjs(expiration).toISOString();
    const response = await fetchOrThrow(`/api/share/${type}`, {
      method: 'POST',
      body: new URLSearchParams(`${type}Id=${id}&expiration=${expirationTime}`),
    });
    const token = await response.text();
    setLink(`${window.location.origin}?token=${token}`);
  }, [id, expiration, type, setLink]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedShare']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <TextField
              value={item.name}
              label={t(type === 'group' ? 'groupDialog' : 'sharedDevice')}
              disabled
            />
            <TextField
              label={t('userExpirationTime')}
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
            <Button variant="outlined" color="primary" onClick={handleShare}>
              {t('reportShow')}
            </Button>
            <TextField
              value={link || ''}
              onChange={(e) => setLink(e.target.value)}
              label={t('sharedLink')}
              slotProps={{ input: { readOnly: true } }}
            />
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
            onClick={() => navigator.clipboard?.writeText(link)}
            disabled={!link}
          >
            {t('sharedCopy')}
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};

export default SharePage;

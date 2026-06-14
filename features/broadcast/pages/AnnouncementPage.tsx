// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from '@/lib/router';
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
import SelectField from '@/components/ui/SelectField';
import { prefixString } from '@/lib/stringUtils';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const AnnouncementPage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const [users, setUsers] = useState([]);
  const [notificator, setNotificator] = useState();
  const [message, setMessage] = useState({});

  const handleSend = useCatchCallback(async () => {
    const query = new URLSearchParams();
    users.forEach((userId) => query.append('userId', userId));
    await fetchOrThrow(`/api/notifications/send/${notificator}?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    navigate(-1);
  }, [users, notificator, message, navigate]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['serverAnnouncement']}>
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <SelectField
              multiple
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              endpoint="/api/users"
              label={t('settingsUsers')}
            />
            <SelectField
              value={notificator}
              onChange={(e) => setNotificator(e.target.value)}
              endpoint="/api/notifications/notificators?announcement=true"
              keyGetter={(it) => it.type}
              titleGetter={(it) => t(prefixString('notificator', it.type))}
              label={t('notificationNotificators')}
            />
            <TextField
              value={message.subject}
              onChange={(e) => setMessage({ ...message, subject: e.target.value })}
              label={t('sharedSubject')}
            />
            <TextField
              value={message.body}
              onChange={(e) => setMessage({ ...message, body: e.target.value })}
              label={t('commandMessage')}
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
            onClick={handleSend}
            disabled={!notificator || !message.subject || !message.body}
          >
            {t('commandSend')}
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};

export default AnnouncementPage;

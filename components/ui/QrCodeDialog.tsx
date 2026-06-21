// @ts-nocheck
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, TextField, Button, useTheme } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { QRCode } from 'react-qr-code';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  qrCode: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const QrCodeDialog = ({ open, onClose }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const t = useTranslation();

  const [serverUrl, setServerUrl] = useState('');
  const [queryParams, setQueryParams] = useState('');

  const fullUrl = queryParams ? `${serverUrl}?${queryParams}` : serverUrl;

  useEffect(() => {
    setServerUrl(window.location.origin);
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <div className={classes.qrCode}>
          <QRCode value={fullUrl} size={theme.dimensions.qrCodeSize} />
        </div>

        <TextField
          label={t('settingsServer')}
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          margin="dense"
          fullWidth
        />

        <TextField
          label={t('commandConfiguration')}
          value={queryParams}
          onChange={(e) => setQueryParams(e.target.value)}
          margin="dense"
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('sharedCancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeDialog;

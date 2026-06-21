// @ts-nocheck
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { VpnLockIcon } from '@/components/ui/icons';
import { makeStyles } from '@/components/ui/styles';
import {
  Autocomplete,
  Button,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from '@/components/ui';
import { useNavigate } from '@/lib/router';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import Loader from '@/components/ui/Loader';
import { errorsActions } from '@/store';
import LoginLayout from '@/features/auth/LoginLayout';
import { AuthFooter, AuthLinkButton, AuthMessage } from '@/features/auth/AuthForm';

const currentServer = `${window.location.protocol}//${window.location.host}`;

const officialServers = [
  currentServer,
  'https://demo.traccar.org',
  'https://demo2.traccar.org',
  'https://demo3.traccar.org',
  'https://demo4.traccar.org',
  'https://server.traccar.org',
  'http://localhost:8082',
  'http://localhost:3000',
].filter((value, index, self) => self.indexOf(value) === index);

const useStyles = makeStyles()((theme) => ({
  icon: {
    textAlign: 'center',
    fontSize: '3rem',
    color: theme.palette.neutral.main,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  field: {
    margin: 0,
  },
  buttons: {
    marginTop: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  scannerVideo: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
  },
}));

const ChangeServerPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const filter = createFilterOptions();
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [inputValue, setInputValue] = useState(currentServer);
  const [scannerOpen, setScannerOpen] = useState(false);

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (inputValue && validateUrl(inputValue)) {
      handleSubmit(inputValue);
    } else {
      setInvalid(true);
    }
  };

  const handleSubmit = (url) => {
    setLoading(true);
    if (window.webkit && window.webkit.messageHandlers.appInterface) {
      window.webkit.messageHandlers.appInterface.postMessage(`server|${url}`);
    } else if (window.appInterface) {
      window.appInterface.postMessage(`server|${url}`);
    } else {
      window.location.replace(url);
    }
  };

  const handleScanResult = (codes) => {
    if (codes && codes.length) {
      const value = codes[0].rawValue || codes[0].value || '';
      if (value) {
        setInputValue(value);
        setInvalid(!validateUrl(value));
        setScannerOpen(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <LoginLayout
        onSubmit={handleFormSubmit}
        title="Change server"
        subtitle="Connect this client to a different Traccar server."
      >
        <div className={classes.container}>
          <VpnLockIcon className={classes.icon} />
          {invalid && (
            <AuthMessage tone="error">
              Enter a full server URL starting with http:// or https://.
            </AuthMessage>
          )}
          <Autocomplete
            freeSolo
            className={classes.field}
            options={officialServers}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label={`${t('settingsServer')} *`}
                error={invalid}
                helperText="Example: https://server.example.com"
              />
            )}
            value={currentServer}
            onChange={(_, value) =>
              value && validateUrl(value) ? handleSubmit(value) : setInvalid(true)
            }
            inputValue={inputValue}
            onInputChange={(_, value) => {
              setInputValue(value);
              setInvalid(false);
            }}
            filterOptions={filter}
          />
          <div className={classes.buttons}>
            {Boolean(navigator?.mediaDevices?.getUserMedia) && (
              <Button
                type="button"
                color="primary"
                variant="outlined"
                onClick={() => setScannerOpen(true)}
              >
                {t('sharedQrCode')}
              </Button>
            )}
            <Button type="submit" color="primary" variant="contained" fullWidth>
              {t('sharedSave')}
            </Button>
          </div>
          <AuthFooter>
            <AuthLinkButton onClick={() => navigate(-1)}>{t('sharedCancel')}</AuthLinkButton>
          </AuthFooter>
        </div>
      </LoginLayout>

      <Dialog fullWidth maxWidth="sm" open={scannerOpen} onClose={() => setScannerOpen(false)}>
        <DialogContent>
          <Scanner
            constraints={{ facingMode: 'environment' }}
            onScan={handleScanResult}
            onError={(error) => dispatch(errorsActions.push(String(error)))}
            className={classes.scannerVideo}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerOpen(false)}>{t('sharedCancel')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangeServerPage;

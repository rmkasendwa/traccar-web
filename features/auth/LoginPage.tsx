// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Button,
  Snackbar,
  IconButton,
  Tooltip,
} from '@/components/ui';
import CountryFlag from 'react-country-flag';
import { makeStyles } from '@/components/ui/styles';
import { CloseIcon } from '@/components/ui/icons';
import { VpnLockIcon } from '@/components/ui/icons';
import { QrCode2Icon } from '@/components/ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@/lib/router';
import { sessionActions } from '@/store';
import { useLocalization, useTranslation } from '@/providers/localization/LocalizationProvider';
import LoginLayout from '@/features/auth/LoginLayout';
import {
  AuthFooter,
  AuthLinkButton,
  AuthMessage,
  AuthPasswordField,
  AuthTextField,
} from '@/features/auth/AuthForm';
import usePersistedState from '@/lib/usePersistedState';
import {
  generateLoginToken,
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from '@/controllers/NativeInterface';
import { useCatch } from '@/lib/react';
import QrCodeDialog from '@/components/ui/QrCodeDialog';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.25),
  },
  registerButton: {
    minWidth: 'unset',
  },
  flag: {
    marginRight: theme.spacing(1),
  },
  forgot: {
    alignSelf: 'flex-end',
    minHeight: 'auto',
    padding: 0,
    fontWeight: 700,
  },
}));

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const { languages, language, setLocalLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const languageEnabled = useSelector((state) => {
    const attributes = state.session.server.attributes;
    return !attributes.language && !attributes['ui.disableLoginLanguage'];
  });
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector(
    (state) => state.session.server.openIdEnabled && state.session.server.openIdForce,
  );
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const validate = () => ({
    email: email.trim() ? '' : 'Please enter your email address or username.',
    password: password ? '' : 'Please enter your password.',
    code: codeEnabled && !code.trim() ? 'Please enter your verification code.' : '',
  });

  const errors = validate();

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setFailed(false);
    if (Object.values(errors).some(Boolean)) {
      return;
    }
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
        setFailed(false);
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetchOrThrow(`/api/session?token=${encodeURIComponent(token)}`);
    const user = await response.json();
    dispatch(sessionActions.updateUser(user));
    navigate('/');
  });

  const handleTokenLoginRef = useRef(handleTokenLogin);
  handleTokenLoginRef.current = handleTokenLogin;

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLoginRef.current(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  return (
    <LoginLayout
      onSubmit={handlePasswordLogin}
      title={openIdForced ? 'Single sign-on' : 'Welcome back'}
      subtitle={
        openIdForced
          ? 'Continue with your organization account.'
          : 'Sign in with your account credentials to continue.'
      }
    >
      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <IconButton color="primary" onClick={() => navigate('/change-server')}>
            <Tooltip
              title={`${t('settingsServer')}: ${window.location.hostname}`}
              open={showServerTooltip}
              arrow
            >
              <VpnLockIcon />
            </Tooltip>
          </IconButton>
        )}
        {!nativeEnvironment && (
          <IconButton color="primary" onClick={() => setShowQr(true)}>
            <QrCode2Icon />
          </IconButton>
        )}
        {languageEnabled && (
          <FormControl>
            <Select value={language} onChange={(e) => setLocalLanguage(e.target.value)}>
              {languageList.map((it) => (
                <MenuItem key={it.code} value={it.code}>
                  <span className={classes.flag}>
                    <CountryFlag countryCode={it.country} svg />
                  </span>
                  {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <div className={classes.container}>
        {failed && (
          <AuthMessage tone="error">
            Invalid username or password. Check your details and try again.
          </AuthMessage>
        )}
        {!openIdForced && (
          <>
            <AuthTextField
              required
              label="Email or username"
              name="email"
              value={email}
              autoComplete="email"
              autoFocus={!email}
              helperText="Use the email address or username for your account."
              errorText={errors.email}
              touched={submitted || touched.email}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              onChange={(e) => {
                setEmail(e.target.value);
                setFailed(false);
              }}
            />
            <AuthPasswordField
              label={t('userPassword')}
              name="password"
              value={password}
              visible={showPassword}
              onToggleVisible={() => setShowPassword(!showPassword)}
              autoComplete="current-password"
              autoFocus={!!email}
              helperText="Keep your password private."
              errorText={errors.password}
              touched={submitted || touched.password}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(e) => {
                setPassword(e.target.value);
                setFailed(false);
              }}
            />
            {codeEnabled && (
              <AuthTextField
                required
                label={t('loginTotpCode')}
                name="code"
                value={code}
                type="number"
                helperText="Enter the current code from your authenticator app."
                errorText={errors.code}
                touched={submitted || touched.code}
                onBlur={() => setTouched((current) => ({ ...current, code: true }))}
                onChange={(e) => setCode(e.target.value)}
              />
            )}
            {emailEnabled && (
              <Button
                type="button"
                variant="text"
                color="primary"
                className={classes.forgot}
                onClick={() => navigate('/reset-password')}
              >
                Forgot your password?
              </Button>
            )}
            <Button type="submit" variant="contained" color="secondary" fullWidth>
              {t('loginLogin')}
            </Button>
          </>
        )}
        {openIdEnabled && (
          <Button onClick={() => handleOpenIdLogin()} variant="contained" color="secondary">
            {t('loginOpenId')}
          </Button>
        )}
        {!openIdForced && (
          <div className={classes.extraContainer}>
            {registrationEnabled && (
              <AuthFooter>
                <span>Don't have an account?</span>
                <AuthLinkButton onClick={() => navigate('/register')}>Register</AuthLinkButton>
              </AuthFooter>
            )}
          </div>
        )}
      </div>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LoginLayout>
  );
};

export default LoginPage;

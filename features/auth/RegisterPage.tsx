// @ts-nocheck
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Snackbar } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useNavigate } from '@/lib/router';
import LoginLayout from '@/features/auth/LoginLayout';
import {
  AuthFooter,
  AuthLinkButton,
  AuthMessage,
  AuthPasswordField,
  AuthTextField,
  getPasswordStrength,
  PasswordStrengthMeter,
} from '@/features/auth/AuthForm';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { snackBarDurationShortMs } from '@/lib/duration';
import { useAsyncTask } from '@/lib/react';
import { sessionActions } from '@/store';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  match: {
    marginTop: theme.spacing(-1),
    color: theme.palette.success.main,
    fontSize: 12,
  },
}));

const RegisterPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpKey, setTotpKey] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState({});

  useAsyncTask(
    async ({ signal }) => {
      if (totpForce) {
        const response = await fetchOrThrow('/api/users/totp', { method: 'POST', signal });
        setTotpKey(await response.text());
      }
    },
    [totpForce, setTotpKey],
  );

  const emailRequired = !server.newServer;
  const validate = () => ({
    name: name.trim() ? '' : 'Please enter your name.',
    email:
      !emailRequired || /(.+)@(.+)\.(.{2,})/.test(email)
        ? ''
        : 'Please enter a valid email address.',
    password: password.length >= 8 ? '' : 'Password must contain at least 8 characters.',
    confirmPassword: confirmPassword && password === confirmPassword ? '' : 'Passwords must match.',
    totpKey: totpForce && !totpKey ? 'The verification key is still loading.' : '',
  });

  const errors = validate();
  const passwordMatches = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError('');
    if (Object.values(errors).some(Boolean) || getPasswordStrength(password).score < 1) {
      return;
    }
    try {
      await fetchOrThrow('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, totpKey }),
      });
      setSnackbarOpen(true);
    } catch (error) {
      setSubmitError(
        error.message || 'Registration failed. Please check your details and try again.',
      );
    }
  };

  return (
    <LoginLayout
      onSubmit={handleSubmit}
      title={t('loginRegister')}
      subtitle="Create your account with a name, email address, and secure password."
    >
      <div className={classes.container}>
        {submitError && <AuthMessage tone="error">{submitError}</AuthMessage>}
        <AuthTextField
          required
          label={t('sharedName')}
          name="name"
          value={name}
          autoComplete="name"
          autoFocus
          helperText="This is the display name shown inside the application."
          errorText={errors.name}
          touched={submitted || touched.name}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          onChange={(event) => setName(event.target.value)}
        />
        <AuthTextField
          required={emailRequired}
          type="email"
          label={t('userEmail')}
          name="email"
          value={email}
          autoComplete="email"
          helperText="Used for account sign in and password recovery."
          errorText={errors.email}
          touched={submitted || touched.email}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthPasswordField
          label={t('userPassword')}
          name="password"
          value={password}
          visible={showPassword}
          onToggleVisible={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
          helperText="Must contain at least 8 characters."
          errorText={errors.password}
          touched={submitted || touched.password}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordStrengthMeter password={password} />
        <AuthPasswordField
          label="Confirm password"
          name="confirmPassword"
          value={confirmPassword}
          visible={showPassword}
          onToggleVisible={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
          helperText="Re-enter your password to avoid typos."
          errorText={errors.confirmPassword}
          touched={submitted || touched.confirmPassword}
          onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {passwordMatches && <div className={classes.match}>Passwords match.</div>}
        {totpForce && (
          <AuthTextField
            required
            label={t('loginTotpKey')}
            name="totpKey"
            value={totpKey || ''}
            helperText="Save this key in your authenticator app before continuing."
            errorText={errors.totpKey}
            touched={submitted || touched.totpKey}
            slotProps={{
              input: { readOnly: true },
            }}
          />
        )}
        <Button variant="contained" color="secondary" type="submit" fullWidth>
          {t('loginRegister')}
        </Button>
        {!server.newServer && (
          <AuthFooter>
            <span>Already have an account?</span>
            <AuthLinkButton onClick={() => navigate('/login')}>Sign in</AuthLinkButton>
          </AuthFooter>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(sessionActions.updateServer({ ...server, newServer: false }));
          navigate('/login');
        }}
        autoHideDuration={snackBarDurationShortMs}
        message={t('loginCreated')}
      />
    </LoginLayout>
  );
};

export default RegisterPage;

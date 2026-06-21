// @ts-nocheck
import { useState } from 'react';
import { Button, Snackbar } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useNavigate, useSearchParams } from '@/lib/router';
import LoginLayout from '@/features/auth/LoginLayout';
import {
  AuthFooter,
  AuthLinkButton,
  AuthMessage,
  AuthPasswordField,
  AuthTextField,
  PasswordStrengthMeter,
} from '@/features/auth/AuthForm';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { snackBarDurationShortMs } from '@/lib/duration';
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

const ResetPasswordPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('passwordReset');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState({});

  const validate = () => ({
    email: !token && !/(.+)@(.+)\.(.{2,})/.test(email) ? 'Please enter your email address.' : '',
    password: token && password.length < 8 ? 'Password must contain at least 8 characters.' : '',
    confirmPassword:
      token && (!confirmPassword || password !== confirmPassword) ? 'Passwords must match.' : '',
  });

  const errors = validate();
  const passwordMatches = token && password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError('');
    if (Object.values(errors).some(Boolean)) {
      return;
    }
    try {
      if (!token) {
        await fetchOrThrow('/api/password/reset', {
          method: 'POST',
          body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
        });
      } else {
        await fetchOrThrow('/api/password/update', {
          method: 'POST',
          body: new URLSearchParams(
            `token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
          ),
        });
      }
      setSnackbarOpen(true);
    } catch (error) {
      setSubmitError(
        error.message ||
          (token
            ? 'Unable to reset this password. The link may have expired.'
            : 'Unable to send reset instructions. Please try again.'),
      );
    }
  };

  return (
    <LoginLayout
      onSubmit={handleSubmit}
      title={!token ? t('loginReset') : 'Create a new password'}
      subtitle={
        !token
          ? 'Enter your email address and we will send you instructions to reset your password.'
          : 'Choose a new password for your account.'
      }
    >
      <div className={classes.container}>
        {submitError && <AuthMessage tone="error">{submitError}</AuthMessage>}
        {!token ? (
          <AuthTextField
            required
            type="email"
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            helperText="Used to find your account and send recovery instructions."
            errorText={errors.email}
            touched={submitted || touched.email}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={(event) => setEmail(event.target.value)}
          />
        ) : (
          <>
            <AuthPasswordField
              label="New password"
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
              helperText="Re-enter your new password to confirm it."
              errorText={errors.confirmPassword}
              touched={submitted || touched.confirmPassword}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {passwordMatches && <div className={classes.match}>Passwords match.</div>}
          </>
        )}
        <Button variant="contained" color="secondary" type="submit" fullWidth>
          {t('loginReset')}
        </Button>
        <AuthFooter>
          <AuthLinkButton onClick={() => navigate('/login')}>Return to Login</AuthLinkButton>
        </AuthFooter>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate('/login')}
        autoHideDuration={snackBarDurationShortMs}
        message={!token ? t('loginResetSuccess') : t('loginUpdateSuccess')}
      />
    </LoginLayout>
  );
};

export default ResetPasswordPage;

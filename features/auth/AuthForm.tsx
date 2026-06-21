// @ts-nocheck
import { useId } from 'react';
import { Button, IconButton, InputAdornment, TextField, Typography } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import {
  CheckCircleOutlinedIcon,
  ErrorIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from '@/components/ui/icons';

const useStyles = makeStyles()((theme, { tone } = {}) => ({
  field: {
    '& input': {
      minHeight: 44,
    },
  },
  required: {
    color: theme.palette.error.main,
    fontWeight: 700,
    marginLeft: 2,
  },
  passwordButton: {
    marginRight: 2,
  },
  strength: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(-1),
  },
  strengthTrack: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(0.5),
  },
  strengthSegment: {
    height: 5,
    borderRadius: 999,
    background: theme.palette.action.disabledBackground,
  },
  strengthSegmentActive: {
    background:
      tone === 'strong'
        ? theme.palette.success.main
        : tone === 'good'
          ? theme.palette.info.main
          : tone === 'fair'
            ? theme.palette.warning.main
            : theme.palette.error.main,
  },
  strengthLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: 12,
  },
  message: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: `1px solid ${
      tone === 'success'
        ? theme.palette.success.light
        : tone === 'error'
          ? theme.palette.error.light
          : theme.palette.divider
    }`,
    background:
      tone === 'success'
        ? 'rgba(22, 163, 74, 0.08)'
        : tone === 'error'
          ? 'rgba(220, 38, 38, 0.08)'
          : theme.palette.action.selected,
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.text.secondary,
    fontSize: 14,
  },
  linkButton: {
    minHeight: 'auto',
    padding: 0,
    fontWeight: 700,
  },
}));

export const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
  const levels = [
    { score: 0, tone: 'weak', label: 'Weak', feedback: 'Use at least 8 characters.' },
    { score: 1, tone: 'weak', label: 'Weak', feedback: 'Add more variety to this password.' },
    { score: 2, tone: 'fair', label: 'Fair', feedback: 'Add a number or symbol to improve it.' },
    { score: 3, tone: 'good', label: 'Good', feedback: 'This password is almost there.' },
    { score: 4, tone: 'strong', label: 'Strong', feedback: 'Strong password.' },
  ];
  return levels[score];
};

export const AuthTextField = ({
  label,
  required,
  helperText,
  errorText,
  touched,
  id,
  ...props
}) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const helperId = `${fieldId}-helper`;
  const error = Boolean(touched && errorText);
  const { classes } = useStyles();

  return (
    <TextField
      {...props}
      id={fieldId}
      className={classes.field}
      helperId={helperId}
      label={
        required ? (
          <>
            {label}
            <span aria-hidden="true" className={classes.required}>
              *
            </span>
          </>
        ) : (
          label
        )
      }
      error={error}
      helperText={error ? errorText : helperText}
      slotProps={{
        ...props.slotProps,
        htmlInput: {
          ...props.slotProps?.htmlInput,
          'aria-describedby': helperText || errorText ? helperId : undefined,
          'aria-invalid': error || undefined,
          required,
        },
      }}
    />
  );
};

export const AuthPasswordField = ({
  label,
  visible,
  onToggleVisible,
  helperText,
  errorText,
  touched,
  ...props
}) => {
  const { classes } = useStyles();
  return (
    <AuthTextField
      {...props}
      label={label}
      required
      type={visible ? 'text' : 'password'}
      helperText={helperText}
      errorText={errorText}
      touched={touched}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                className={classes.passwordButton}
                onClick={onToggleVisible}
                size="small"
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export const PasswordStrengthMeter = ({ password }) => {
  const strength = getPasswordStrength(password);
  const { classes, cx } = useStyles({ tone: strength.tone });
  return (
    <div className={classes.strength} aria-live="polite">
      <div className={classes.strengthTrack} aria-hidden="true">
        {[1, 2, 3, 4].map((value) => (
          <span
            key={value}
            className={cx(
              classes.strengthSegment,
              value <= Math.max(strength.score, password ? 1 : 0) && classes.strengthSegmentActive,
            )}
          />
        ))}
      </div>
      <div className={classes.strengthLabel}>
        <span>Password strength: {password ? strength.label : 'Not started'}</span>
        <span>{password ? strength.feedback : 'Use 8 or more characters.'}</span>
      </div>
    </div>
  );
};

export const AuthMessage = ({ tone = 'info', children }) => {
  const { classes } = useStyles({ tone });
  const Icon = tone === 'success' ? CheckCircleOutlinedIcon : ErrorIcon;
  return (
    <div className={classes.message} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon fontSize="small" />
      <Typography variant="body2">{children}</Typography>
    </div>
  );
};

export const AuthFooter = ({ children }) => {
  const { classes } = useStyles();
  return <div className={classes.footer}>{children}</div>;
};

export const AuthLinkButton = (props) => {
  const { classes } = useStyles();
  return (
    <Button
      type="button"
      variant="text"
      color="primary"
      className={classes.linkButton}
      {...props}
    />
  );
};

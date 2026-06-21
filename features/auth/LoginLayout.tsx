// @ts-nocheck
import { Paper, Typography } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useTheme } from '@/components/ui';
import LogoImage from '@/features/auth/LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100dvh',
    overflow: 'auto',
    background:
      theme.palette.mode === 'dark'
        ? 'radial-gradient(circle at top left, rgba(159, 168, 218, 0.18), transparent 28%), #111827'
        : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 46%, #f0fdf4 100%)',
    color: theme.palette.text.primary,
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '42%',
    minWidth: 360,
    padding: theme.spacing(6),
    background: '#172554',
    color: '#fff',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      minWidth: 0,
      padding: theme.spacing(3, 3, 2),
      background: 'transparent',
      color: theme.palette.text.primary,
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  brand: {
    '& > *': {
      margin: 0,
    },
  },
  sidebarContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    maxWidth: 440,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  eyebrow: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  sidebarTitle: {
    fontSize: 40,
    lineHeight: 1.1,
    fontWeight: 700,
  },
  sidebarText: {
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 1.7,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    boxShadow: 'none',
    background: 'transparent',
    padding: theme.spacing(5, 4),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 3, 4),
      alignItems: 'stretch',
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 2, 3),
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    maxWidth: 464,
    padding: theme.spacing(5),
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    background: theme.palette.background.paper,
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.16)',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  },
  mobileLogo: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: theme.spacing(1),
    },
  },
}));

const LoginLayout = ({ children, onSubmit, title, subtitle }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        <div className={classes.brand}>
          <LogoImage color={theme.palette.mode === 'dark' ? theme.palette.primary.main : '#fff'} />
        </div>
        <div className={classes.sidebarContent}>
          <Typography className={classes.eyebrow} variant="caption">
            Fleet visibility starts here
          </Typography>
          <Typography className={classes.sidebarTitle} component="h1">
            Secure access to your tracking workspace.
          </Typography>
          <Typography className={classes.sidebarText}>
            Sign in, create an account, or recover access with a focused experience that works on
            every screen.
          </Typography>
        </div>
      </div>
      <Paper className={classes.paper}>
        <form className={classes.form} onSubmit={onSubmit} noValidate>
          <div className={classes.mobileLogo}>
            <LogoImage color={theme.palette.primary.main} />
          </div>
          {(title || subtitle) && (
            <div>
              {title && (
                <Typography variant="h5" component="h2">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="textSecondary">
                  {subtitle}
                </Typography>
              )}
            </div>
          )}
          {children}
        </form>
      </Paper>
    </main>
  );
};

export default LoginLayout;

// @ts-nocheck
import type { ReactNode } from 'react';
import { useNavigate } from '@/lib/router';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery, useTheme } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import BottomMenu from '@/components/layout/BottomMenu';
import SocketController from '@/controllers/SocketController';
import CachingController from '@/controllers/CachingController';
import { useCatch, useAsyncTask } from '@/lib/react';
import { sessionActions } from '@/store';
import UpdateController from '@/controllers/UpdateController';
import MotionController from '@/controllers/MotionController';
import TermsDialog from '@/components/ui/TermsDialog';
import Loader from '@/components/ui/Loader';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const useStyles = makeStyles()(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    minHeight: 0,
  },
  page: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  menu: {
    zIndex: 4,
    '@media print': {
      display: 'none',
    },
  },
}));

type AppProps = {
  children: ReactNode;
};

const App = ({ children }: AppProps) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const newServer = useSelector((state) => state.session.server.newServer);
  const termsUrl = useSelector((state) => state.session.server.attributes.termsUrl);
  const user = useSelector((state) => state.session.user);

  const acceptTerms = useCatch(async () => {
    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes: { ...user.attributes, termsAccepted: true } }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
  });

  useAsyncTask(
    async ({ signal }) => {
      if (!user) {
        const response = await fetch('/api/session', { signal });
        if (response.ok) {
          dispatch(sessionActions.updateUser(await response.json()));
        } else {
          window.sessionStorage.setItem(
            'postLogin',
            window.location.pathname + window.location.search,
          );
          navigate(newServer ? '/register' : '/login', { replace: true });
        }
      }
      return null;
    },
    [user, dispatch, navigate, newServer],
  );

  if (user == null) {
    return <Loader />;
  }
  if (termsUrl && !user.attributes.termsAccepted) {
    return <TermsDialog open onCancel={() => navigate('/login')} onAccept={() => acceptTerms()} />;
  }
  return (
    <div className={classes.root}>
      <SocketController />
      <CachingController />
      <UpdateController />
      <MotionController />
      <div className={classes.page}>{children}</div>
      {!desktop && (
        <div className={classes.menu}>
          <BottomMenu />
        </div>
      )}
    </div>
  );
};

export default App;

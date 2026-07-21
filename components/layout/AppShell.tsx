// @ts-nocheck
'use client';

import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@/lib/router';
import { routes } from '@/lib/routes';
import { useDispatch, useSelector } from 'react-redux';
import SocketController from '@/controllers/SocketController';
import CachingController from '@/controllers/CachingController';
import { useCatch, useAsyncTask } from '@/lib/react';
import { sessionActions } from '@/store';
import UpdateController from '@/controllers/UpdateController';
import MotionController from '@/controllers/MotionController';
import TermsDialog from '@/components/ui/TermsDialog';
import Loader from '@/components/ui/Loader';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

type AppProps = {
  children: ReactNode;
  initialUser?: unknown;
};

const App = ({ children, initialUser }: AppProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const newServer = useSelector((state) => state.session.server.newServer);
  const termsUrl = useSelector((state) => state.session.server.attributes.termsUrl);
  const user = useSelector((state) => state.session.user);

  useEffect(() => {
    if (initialUser && !user) {
      dispatch(sessionActions.updateUser(initialUser));
    }
  }, [dispatch, initialUser, user]);

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
      if (!user && !initialUser) {
        const response = await fetch('/api/session', { signal });
        if (response.ok) {
          dispatch(sessionActions.updateUser(await response.json()));
        } else {
          window.sessionStorage.setItem(
            'postLogin',
            window.location.pathname + window.location.search,
          );
          navigate(newServer ? routes.register : routes.login, { replace: true });
        }
      }
      return null;
    },
    [user, initialUser, dispatch, navigate, newServer],
  );

  if (user == null) {
    return <Loader />;
  }
  if (termsUrl && !user.attributes.termsAccepted) {
    return (
      <TermsDialog open onCancel={() => navigate(routes.login)} onAccept={() => acceptTerms()} />
    );
  }
  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <SocketController />
      <CachingController />
      <UpdateController />
      <MotionController />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default App;

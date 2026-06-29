// @ts-nocheck
'use client';

import type { ReactNode } from 'react';
import { useLocation, useNavigate } from '@/lib/router';
import { useDispatch, useSelector } from 'react-redux';
import BottomMenu from '@/components/layout/BottomMenu';
import SocketController from '@/controllers/SocketController';
import CachingController from '@/controllers/CachingController';
import { useCatch, useAsyncTask } from '@/lib/react';
import store, { sessionActions } from '@/store';
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
  if (initialUser && !store.getState().session.user) {
    store.dispatch(sessionActions.updateUser(initialUser));
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex h-dvh min-h-0 flex-col">
      <SocketController />
      <CachingController />
      <UpdateController />
      <MotionController />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      {location.pathname !== '/' && (
        <div className="z-40 shrink-0 md:hidden print:hidden">
          <BottomMenu />
        </div>
      )}
    </div>
  );
};

export default App;

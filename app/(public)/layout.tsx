'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@/lib/router';
import Loader from '@/components/ui/Loader';
import { sessionActions } from '@/store';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/session', { signal: controller.signal })
      .then(async (response) => {
        if (response.ok) {
          dispatch(sessionActions.updateUser(await response.json()));
          navigate('/', { replace: true });
        } else {
          setAllowed(true);
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setAllowed(true);
        }
      });
    return () => controller.abort();
  }, [dispatch, navigate]);

  if (!allowed) {
    return <Loader />;
  }

  return children;
}

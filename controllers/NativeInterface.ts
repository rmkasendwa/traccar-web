// @ts-nocheck
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncTask } from '@/lib/react';
import { sessionActions } from '@/store';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

export const nativeEnvironment =
  typeof window !== 'undefined' &&
  (window.appInterface || (window.webkit && window.webkit.messageHandlers.appInterface));

export const nativePostMessage = (message) => {
  if (window.webkit && window.webkit.messageHandlers.appInterface) {
    window.webkit.messageHandlers.appInterface.postMessage(message);
  } else if (window.appInterface) {
    window.appInterface.postMessage(message);
  }
};

export const generateLoginToken = async () => {
  if (nativeEnvironment) {
    let token = '';
    try {
      const expiration = dayjs().add(6, 'months').toISOString();
      const response = await fetch('/api/session/token', {
        method: 'POST',
        body: new URLSearchParams(`expiration=${expiration}`),
      });
      if (response.ok) {
        token = await response.text();
      }
    } catch {
      token = '';
    }
    nativePostMessage(`login|${token}`);
  }
};

export const handleLoginTokenListeners = new Set();
const updateNotificationTokenListeners = new Set();
export const handleNativeNotificationListeners = new Set();

if (typeof window !== 'undefined') {
  window.handleLoginToken = (token) => {
    handleLoginTokenListeners.forEach((listener) => listener(token));
  };
  window.updateNotificationToken = (token) => {
    updateNotificationTokenListeners.forEach((listener) => listener(token));
  };
  window.handleNativeNotification = (message) => {
    handleNativeNotificationListeners.forEach((listener) => listener(message));
  };
}

const NativeInterface = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.session.user);
  const [notificationToken, setNotificationToken] = useState(null);

  useEffect(() => {
    const listener = (token) => setNotificationToken(token);
    updateNotificationTokenListeners.add(listener);
    return () => updateNotificationTokenListeners.delete(listener);
  }, [setNotificationToken]);

  useAsyncTask(
    async ({ signal }) => {
      if (user && notificationToken) {
        window.localStorage.setItem('notificationToken', notificationToken);
        setNotificationToken(null);

        const tokens = user.attributes.notificationTokens?.split(',') || [];
        if (!tokens.includes(notificationToken)) {
          const updatedUser = {
            ...user,
            attributes: {
              ...user.attributes,
              notificationTokens: [...tokens.slice(-2), notificationToken].join(','),
            },
          };

          const response = await fetchOrThrow(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
            signal,
          });
          dispatch(sessionActions.updateUser(await response.json()));
        }
      }
    },
    [user, notificationToken, setNotificationToken, dispatch],
  );

  return null;
};

export default NativeInterface;

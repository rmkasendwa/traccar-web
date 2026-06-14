// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

export const savePersistedState = (key, value) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export default (key, defaultValue) => {
  const defaultRef = useRef(defaultValue);

  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultRef.current;
    }
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue ? JSON.parse(stickyValue) : defaultRef.current;
  });

  useEffect(() => {
    if (value !== defaultRef.current) {
      savePersistedState(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue];
};

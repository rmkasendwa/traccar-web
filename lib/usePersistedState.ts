// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

export const savePersistedState = (key, value) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export default (key, defaultValue) => {
  const defaultRef = useRef(defaultValue);
  const [value, setValue] = useState(defaultRef.current);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stickyValue = window.localStorage.getItem(key);
    if (stickyValue) {
      setValue(JSON.parse(stickyValue));
    }
    setInitialized(true);
  }, [key]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (value !== defaultRef.current) {
      savePersistedState(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  }, [initialized, key, value]);

  return [value, setValue];
};

'use client';

import type { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from '@/lib/router';
import Loader from '@/components/ui/Loader';
import { useAsyncTask } from '@/lib/react';
import { devicesActions } from '@/store';
import { generateLoginToken } from '@/controllers/NativeInterface';
import { useLocalization } from '@/providers/localization/LocalizationProvider';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { parseApiResponse, traccarSchemas } from '@/lib/api/schemas';

type QueryParameterControllerProps = {
  children: ReactNode;
};

export default function QueryParameterController({ children }: QueryParameterControllerProps) {
  const dispatch = useDispatch();
  const { setLocalLanguage } = useLocalization();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasQueryParams = ['locale', 'uniqueId', 'openid'].some((key) => searchParams.has(key));

  useAsyncTask(
    async ({ signal }: { signal: AbortSignal }) => {
      if (!hasQueryParams) {
        return;
      }

      const newParams = new URLSearchParams(searchParams);
      const locale = searchParams.get('locale');
      const uniqueId = searchParams.get('uniqueId');

      if (locale) {
        Reflect.apply(setLocalLanguage, null, [locale]);
        newParams.delete('locale');
      }
      if (uniqueId) {
        const response = await fetchOrThrow(
          `/api/devices?uniqueId=${encodeURIComponent(uniqueId)}`,
          { signal },
        );
        const items = parseApiResponse(traccarSchemas.Device.array(), await response.json());
        const deviceId = items[0]?.id;
        if (deviceId !== undefined) {
          dispatch(devicesActions.selectId(deviceId));
        }
        newParams.delete('uniqueId');
      }
      if (searchParams.has('openid')) {
        if (searchParams.get('openid') === 'success') {
          generateLoginToken();
        }
        newParams.delete('openid');
      }

      setSearchParams(newParams, { replace: true });
    },
    [hasQueryParams, searchParams, setSearchParams, dispatch, setLocalLanguage],
  );

  return hasQueryParams ? <Loader /> : children;
}

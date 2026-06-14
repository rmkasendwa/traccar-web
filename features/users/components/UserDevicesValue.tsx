// @ts-nocheck
import { useState } from 'react';
import { Link } from '@/components/ui';
import { useCatch } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const UserDevicesValue = ({ userId }) => {
  const t = useTranslation();

  const [devices, setDevices] = useState();

  const loadDevices = useCatch(async () => {
    const query = new URLSearchParams({ userId });
    const response = await fetchOrThrow(`/api/devices?${query.toString()}`);
    setDevices(await response.json());
  });

  if (devices) {
    return devices.length;
  }
  return (
    <Link href="#" onClick={loadDevices}>
      {t('reportShow')}
    </Link>
  );
};

export default UserDevicesValue;

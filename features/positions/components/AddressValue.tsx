// @ts-nocheck
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@/components/ui';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useCatch } from '@/lib/react';
import { formatAddress } from '@/lib/formatter';
import { usePreference } from '@/lib/preferences';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const AddressValue = ({ latitude, longitude, originalAddress }) => {
  const t = useTranslation();

  const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);
  const coordinateFormat = usePreference('coordinateFormat');

  const [address, setAddress] = useState();

  useEffect(() => {
    setAddress(originalAddress);
  }, [latitude, longitude, originalAddress]);

  const showAddress = useCatch(async (event) => {
    event.preventDefault();
    const query = new URLSearchParams({ latitude, longitude });
    const response = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
    setAddress(await response.text());
  });

  if (address) {
    return address;
  }
  if (addressEnabled) {
    return (
      <Link href="#" onClick={showAddress}>
        {t('sharedShowAddress')}
      </Link>
    );
  }
  return formatAddress({ latitude, longitude }, coordinateFormat);
};

export default AddressValue;

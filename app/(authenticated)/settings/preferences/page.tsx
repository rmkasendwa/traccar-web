// @ts-nocheck
'use client';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useNavigate } from '@/lib/router';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  OutlinedInput,
  TextField,
  Button,
} from '@/components/ui';
import { ExpandMoreIcon } from '@/components/ui/icons';
import { CachedIcon } from '@/components/ui/icons';
import { ContentCopyIcon } from '@/components/ui/icons';
import { useTranslation, useTranslationKeys } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import usePositionAttributes from '@/features/positions/hooks/usePositionAttributes';
import { prefixString, unprefixString } from '@/lib/stringUtils';
import SelectField from '@/components/ui/SelectField';
import useMapStyles from '@/features/map/core/useMapStyles';
import useMapOverlays from '@/features/map/overlay/useMapOverlays';
import { useCatch } from '@/lib/react';
import { sessionActions } from '@/store';
import { useAdministrator, useRestriction } from '@/lib/permissions';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import SettingsFormActions from '@/features/settings/components/SettingsFormActions';

const deviceFields = [
  { id: 'name', name: 'sharedName' },
  { id: 'uniqueId', name: 'deviceIdentifier' },
  { id: 'phone', name: 'sharedPhone' },
  { id: 'model', name: 'deviceModel' },
  { id: 'contact', name: 'deviceContact' },
  { id: 'geofenceIds', name: 'sharedGeofence' },
  { id: 'driverUniqueId', name: 'sharedDriver' },
  { id: 'motion', name: 'positionMotion' },
];

const PreferencesPage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const user = useSelector((state) => state.session.user);
  const [attributes, setAttributes] = useState(user.attributes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const versionApp = process.env.NEXT_PUBLIC_APP_VERSION;
  const versionServer = useSelector((state) => state.session.server.version);
  const socket = useSelector((state) => state.session.socket);

  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DD'),
  );

  const mapStyles = useMapStyles();
  const mapOverlays = useMapOverlays();

  const positionAttributes = usePositionAttributes(t);

  const popupItems = Array.from(
    new Set([
      ...Object.keys(positionAttributes),
      ...(attributes.positionItems?.split(',').filter(Boolean) || []),
    ]),
  ).map((id) => ({ id, name: positionAttributes[id]?.name || id }));
  const visibilityOptions = [
    { id: 'none', name: t('sharedDisabled') },
    { id: 'selected', name: t('deviceSelected') },
    { id: 'all', name: t('notificationAlways') },
  ];
  const selectedMapOverlays = attributes.selectedMapOverlay?.split(',').filter(Boolean) || [];
  const orderedMapOverlays = selectedMapOverlays
    .map((id) => mapOverlays.find((overlay) => overlay.id === id) || { id, title: id })
    .reverse();

  const moveSelectedMapOverlay = (overlayId, direction) => {
    const index = selectedMapOverlays.indexOf(overlayId);
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= selectedMapOverlays.length) {
      return;
    }
    const nextMapOverlays = [...selectedMapOverlays];
    [nextMapOverlays[index], nextMapOverlays[targetIndex]] = [
      nextMapOverlays[targetIndex],
      nextMapOverlays[index],
    ];
    setAttributes({ ...attributes, selectedMapOverlay: nextMapOverlays.join(',') });
  };

  const generateToken = useCatch(async () => {
    const expiration = dayjs(tokenExpiration, 'YYYY-MM-DD').toISOString();
    const response = await fetchOrThrow('/api/session/token', {
      method: 'POST',
      body: new URLSearchParams(`expiration=${expiration}`),
    });
    setToken(await response.text());
  });

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const handleSave = useCatch(async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetchOrThrow(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, attributes }),
      });
      dispatch(sessionActions.updateUser(await response.json()));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  });

  const handleReboot = useCatch(async () => {
    const response = await fetch('/api/server/reboot', { method: 'POST' });
    throw Error(response.statusText);
  });

  return (
    <PageLayout bare menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedPreferences']}>
      <div className="preferences-layout mx-auto w-full max-w-5xl">
        {!readonly && (
          <SettingsFormActions
            description={t('settingsPreferencesActionDescription')}
            dirty={JSON.stringify(attributes) !== JSON.stringify(user.attributes)}
            saving={saving}
            saved={saved}
            onCancel={() => navigate(-1)}
            onSave={handleSave}
          />
        )}
        {!readonly && (
          <>
            <Accordion defaultExpanded className="preferences-card preferences-card-wide">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('mapTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <SelectField
                  multiple
                  fullWidth
                  label={t('mapActive')}
                  value={attributes.activeMapStyles?.split(',') || ['openFreeMap', 'osm']}
                  data={mapStyles}
                  titleGetter={(style) =>
                    style.available ? style.title : `${style.title} · ${t('settingsConfigure')}`
                  }
                  onChange={(event) => {
                    const previous = attributes.activeMapStyles?.split(',') || [
                      'openFreeMap',
                      'osm',
                    ];
                    const added = event.target.value.find((id) => !previous.includes(id));
                    const clicked = mapStyles.find((style) => style.id === added);
                    if (clicked && !clicked.available && clicked.id !== 'custom') {
                      const query = new URLSearchParams({ attribute: clicked.attribute });
                      navigate(`/settings/user/${user.id}?${query.toString()}`);
                    } else {
                      setAttributes({
                        ...attributes,
                        activeMapStyles: event.target.value.join(','),
                      });
                    }
                  }}
                />
                <SelectField
                  multiple
                  fullWidth
                  label={t('mapOverlay')}
                  value={selectedMapOverlays}
                  data={mapOverlays}
                  titleGetter={(overlay) =>
                    overlay.available
                      ? overlay.title
                      : `${overlay.title} · ${t('settingsConfigure')}`
                  }
                  onChange={(event) => {
                    const added = event.target.value.find(
                      (id) => !selectedMapOverlays.includes(id),
                    );
                    const clicked = mapOverlays.find((overlay) => overlay.id === added);
                    if (clicked && !clicked.available && clicked.id !== 'custom') {
                      const query = new URLSearchParams({ attribute: clicked.attribute });
                      navigate(`/settings/user/${user.id}?${query.toString()}`);
                    } else if (!clicked || clicked.available) {
                      setAttributes({
                        ...attributes,
                        selectedMapOverlay: event.target.value.join(','),
                      });
                    }
                  }}
                />
                {orderedMapOverlays.length > 1 && (
                  <div className="space-y-2">
                    <span className="block text-sm text-(--color-muted)">
                      {t('settingsLayerOrder')}
                    </span>
                    <div className="space-y-1.5">
                      {orderedMapOverlays.map((overlay, displayIndex) => (
                        <div
                          key={overlay.id}
                          className="flex min-h-11 items-center gap-2 rounded-xl border border-(--color-divider) bg-(--color-paper) px-3"
                        >
                          <span className="min-w-0 flex-1 truncate text-sm">{overlay.title}</span>
                          {displayIndex === 0 && (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                              {t('settingsLayerTop')}
                            </span>
                          )}
                          <IconButton
                            size="small"
                            title={t('settingsMoveLayerUp')}
                            aria-label={t('settingsMoveLayerUp')}
                            disabled={displayIndex === 0}
                            onClick={() => moveSelectedMapOverlay(overlay.id, 'up')}
                          >
                            <ArrowUp size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            title={t('settingsMoveLayerDown')}
                            aria-label={t('settingsMoveLayerDown')}
                            disabled={displayIndex === orderedMapOverlays.length - 1}
                            onClick={() => moveSelectedMapOverlay(overlay.id, 'down')}
                          >
                            <ArrowDown size={16} />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <SelectField
                  multiple
                  fullWidth
                  data={popupItems}
                  value={
                    attributes.positionItems?.split(',') || [
                      'fixTime',
                      'address',
                      'speed',
                      'totalDistance',
                    ]
                  }
                  onChange={(event) => {
                    setAttributes({
                      ...attributes,
                      positionItems: event.target.value.join(','),
                    });
                  }}
                  label={t('attributePopupInfo')}
                />
                <SelectField
                  fullWidth
                  label={t('mapLiveRoutes')}
                  value={attributes.mapLiveRoutes || 'none'}
                  data={visibilityOptions}
                  onChange={(event) =>
                    setAttributes({ ...attributes, mapLiveRoutes: event.target.value })
                  }
                />
                <SelectField
                  fullWidth
                  label={t('mapDirection')}
                  value={attributes.mapDirection || 'selected'}
                  data={visibilityOptions}
                  onChange={(event) =>
                    setAttributes({ ...attributes, mapDirection: event.target.value })
                  }
                />
                <FormGroup className="preferences-toggle-grid">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapGeofences') ? attributes.mapGeofences : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapGeofences: e.target.checked })
                        }
                      />
                    }
                    label={t('attributeShowGeofences')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapFollow') ? attributes.mapFollow : false
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapFollow: e.target.checked })
                        }
                      />
                    }
                    label={t('deviceFollow')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapCluster') ? attributes.mapCluster : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapCluster: e.target.checked })
                        }
                      />
                    }
                    label={t('mapClustering')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapOnSelect') ? attributes.mapOnSelect : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapOnSelect: e.target.checked })
                        }
                      />
                    }
                    label={t('mapOnSelect')}
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <div className="preferences-columns">
          <div className="preferences-column">
            {!readonly && (
              <Accordion className="preferences-card">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{t('deviceTitle')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <SelectField
                    value={attributes.devicePrimary || 'name'}
                    onChange={(e) =>
                      setAttributes({ ...attributes, devicePrimary: e.target.value })
                    }
                    data={deviceFields}
                    titleGetter={(it) => t(it.name)}
                    label={t('devicePrimaryInfo')}
                  />
                  <SelectField
                    value={attributes.deviceSecondary}
                    onChange={(e) =>
                      setAttributes({ ...attributes, deviceSecondary: e.target.value })
                    }
                    data={deviceFields}
                    titleGetter={(it) => t(it.name)}
                    label={t('deviceSecondaryInfo')}
                  />
                </AccordionDetails>
              </Accordion>
            )}
            <Accordion className="preferences-card">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('userToken')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  label={t('userExpirationTime')}
                  type="date"
                  value={tokenExpiration}
                  onChange={(e) => {
                    setTokenExpiration(e.target.value);
                    setToken(null);
                  }}
                />
                <FormControl>
                  <OutlinedInput
                    multiline
                    rows={6}
                    readOnly
                    type="text"
                    value={token || ''}
                    endAdornment={
                      <InputAdornment position="end">
                        <div className={classes.verticalActions}>
                          <IconButton
                            size="small"
                            edge="end"
                            onClick={generateToken}
                            disabled={!!token}
                          >
                            <CachedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            edge="end"
                            onClick={() => navigator.clipboard.writeText(token)}
                            disabled={!token}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </div>
          {!readonly && (
            <div className="preferences-column">
              <Accordion className="preferences-card">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{t('sharedSound')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <SelectField
                    multiple
                    value={attributes.soundEvents?.split(',') || []}
                    onChange={(e) =>
                      setAttributes({ ...attributes, soundEvents: e.target.value.join(',') })
                    }
                    endpoint="/api/notifications/types"
                    keyGetter={(it) => it.type}
                    titleGetter={(it) => t(prefixString('event', it.type))}
                    label={t('eventsSoundEvents')}
                  />
                  <SelectField
                    multiple
                    value={attributes.soundAlarms?.split(',') || ['sos']}
                    onChange={(e) =>
                      setAttributes({ ...attributes, soundAlarms: e.target.value.join(',') })
                    }
                    data={alarms}
                    keyGetter={(it) => it.key}
                    label={t('eventsSoundAlarms')}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion className="preferences-card">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{t('sharedInfoTitle')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <TextField value={versionApp} label={t('settingsAppVersion')} disabled />
                  <TextField
                    value={versionServer || '-'}
                    label={t('settingsServerVersion')}
                    disabled
                  />
                  <TextField
                    value={socket ? t('deviceStatusOnline') : t('deviceStatusOffline')}
                    label={t('settingsConnection')}
                    disabled
                  />
                  <Button variant="outlined" color="primary" onClick={() => navigate('/emulator')}>
                    {t('sharedEmulator')}
                  </Button>
                  {admin && (
                    <Button variant="outlined" color="error" onClick={handleReboot}>
                      {t('serverReboot')}
                    </Button>
                  )}
                </AccordionDetails>
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PreferencesPage;

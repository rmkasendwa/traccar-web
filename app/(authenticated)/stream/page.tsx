'use client';

import HlsConstructor, { Events, type ErrorData, type Events as HlsEvents } from 'hls.js';
import { useEffect, useRef, useState, type ComponentType, type PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton as BaseIconButton,
  Paper as BasePaper,
  TextField as BaseTextField,
  Toolbar as BaseToolbar,
  Typography as BaseTypography,
  useTheme,
} from '@/components/ui';
import BackIcon from '@/components/ui/BackIcon';
import { PlayArrowIcon, StopIcon } from '@/components/ui/icons';
import { makeStyles } from '@/components/ui/styles';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useCatchCallback } from '@/lib/react';
import { useNavigate, useSearchParams } from '@/lib/router';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import type { RootState } from '@/store';
import type { ApiAttributes, ApiId } from '@/types/traccar';

const IconButton = BaseIconButton as ComponentType<
  PropsWithChildren<{
    color?: 'error' | 'primary';
    edge?: 'start' | 'end';
    onClick?: () => void;
    sx?: Record<string, unknown>;
  }>
>;
const Paper = BasePaper as ComponentType<
  PropsWithChildren<{
    square?: boolean;
  }>
>;
const TextField = BaseTextField as ComponentType<{
  className?: string;
  disabled?: boolean;
  label?: string;
  onChange?: (event: { target: { value: string } }) => void;
  size?: 'small';
  type?: 'number';
  value?: number;
}>;
const Toolbar = BaseToolbar as ComponentType<PropsWithChildren>;
const Typography = BaseTypography as ComponentType<
  PropsWithChildren<{
    className?: string;
    variant?: 'h6';
  }>
>;

const useStyles = makeStyles()((theme: ReturnType<typeof useTheme>) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  video: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  title: {
    flexGrow: 1,
  },
  channel: {
    marginInline: theme.spacing(1),
  },
}));

export default function Page() {
  const { classes } = useStyles({});
  const navigate = useNavigate();
  const t = useTranslation();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [channel, setChannel] = useState(1);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');
  const device = useSelector((state: RootState) =>
    deviceId ? state.devices.items[Number(deviceId) as ApiId] : null,
  );

  const playing = activeChannel !== null;

  const sendCommand = useCatchCallback(
    async (type: string, attributes: ApiAttributes) => {
      await fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, type, attributes }),
      });
    },
    [deviceId],
  );

  useEffect(() => {
    if (activeChannel === null || !deviceId || !videoRef.current) {
      return undefined;
    }

    sendCommand('videoStart', { index: activeChannel });

    const hls = new HlsConstructor();
    hls.loadSource(`/api/stream/${deviceId}/${activeChannel}/live.m3u8`);
    hls.attachMedia(videoRef.current);
    hls.on(Events.MANIFEST_PARSED, () => videoRef.current?.play());
    hls.on(Events.ERROR, (_: HlsEvents.ERROR, data: ErrorData) => {
      if (data.fatal) setError(true);
    });

    return () => {
      hls.destroy();
      sendCommand('videoStop', { index: activeChannel });
    };
  }, [deviceId, activeChannel, sendCommand]);

  return (
    <div className={classes.root}>
      <Paper square>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {device?.name || t('linkLiveVideo')}
          </Typography>
          <TextField
            size="small"
            type="number"
            value={channel}
            onChange={(event) => setChannel(Number(event.target.value) || 1)}
            label={t('commandIndex')}
            disabled={playing}
            className={classes.channel}
          />
          <IconButton
            edge="end"
            color={playing ? 'error' : 'primary'}
            onClick={() => {
              setError(false);
              setActiveChannel(playing ? null : channel);
            }}
          >
            {playing ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
      </Paper>
      <div className={classes.video}>
        {error && <Typography>{t('errorConnection')}</Typography>}
        {playing && !error && (
          <video ref={videoRef} className={classes.player} autoPlay muted controls />
        )}
      </div>
    </div>
  );
}

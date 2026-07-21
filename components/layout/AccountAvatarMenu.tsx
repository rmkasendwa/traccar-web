'use client';

import { useMemo, useState, type MouseEventHandler } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { LogOut, Mail, UserRound } from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { routes } from '@/lib/routes';
import { sessionActions } from '@/store';
import { nativePostMessage } from '@/controllers/NativeInterface';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';

type User = {
  id: number;
  name?: string;
  email?: string;
  readonly?: boolean;
  attributes?: Record<string, any>;
};

type ProfileAvatarProps = {
  user?: User | null;
  size?: 'nav' | 'sm' | 'md' | 'lg';
  className?: string;
};

type AccountAvatarMenuProps = {
  className?: string;
  labelClassName?: string;
  placement?: 'bottom-end' | 'top-end' | 'top-start';
  label?: string;
  showLabel?: boolean;
  avatarSize?: ProfileAvatarProps['size'];
};

const avatarSizes = {
  nav: 'h-[19px] w-[19px] text-[0.48rem]',
  sm: 'h-7 w-7 text-[0.65rem]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

const palette = [
  '#0ea5e9',
  '#14b8a6',
  '#22c55e',
  '#84cc16',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#6366f1',
];

const md5 = (input: string) => {
  const rotateLeft = (value: number, shift: number) => (value << shift) | (value >>> (32 - shift));
  const add = (x: number, y: number) =>
    (((x & 0xffff) + (y & 0xffff)) & 0xffff) |
    ((((x >>> 16) + (y >>> 16) + (((x & 0xffff) + (y & 0xffff)) >>> 16)) & 0xffff) << 16);
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) =>
    add(rotateLeft(add(add(a, q), add(x, t)), s), b);
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);
  const utf8 = unescape(encodeURIComponent(input));
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i += 1) {
    words[i >> 2] |= utf8.charCodeAt(i) << ((i % 4) * 8);
  }
  words[utf8.length >> 2] |= 0x80 << ((utf8.length % 4) * 8);
  words[(((utf8.length + 8) >> 6) << 4) + 14] = utf8.length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = ff(a, b, c, d, words[i], 7, -680876936);
    d = ff(d, a, b, c, words[i + 1], 12, -389564586);
    c = ff(c, d, a, b, words[i + 2], 17, 606105819);
    b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4], 7, -176418897);
    d = ff(d, a, b, c, words[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = ff(a, b, c, d, words[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10], 17, -42063);
    b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13], 12, -40341101);
    c = ff(c, d, a, b, words[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15], 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1], 5, -165796510);
    d = gg(d, a, b, c, words[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11], 14, 643717713);
    b = gg(b, c, d, a, words[i], 20, -373897302);
    a = gg(a, b, c, d, words[i + 5], 5, -701558691);
    d = gg(d, a, b, c, words[i + 10], 9, 38016083);
    c = gg(c, d, a, b, words[i + 15], 14, -660478335);
    b = gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = gg(a, b, c, d, words[i + 9], 5, 568446438);
    d = gg(d, a, b, c, words[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3], 14, -187363961);
    b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2], 9, -51403784);
    c = gg(c, d, a, b, words[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12], 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5], 4, -378558);
    d = hh(d, a, b, c, words[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = hh(a, b, c, d, words[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7], 16, -155497632);
    b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13], 4, 681279174);
    d = hh(d, a, b, c, words[i], 11, -358537222);
    c = hh(c, d, a, b, words[i + 3], 16, -722521979);
    b = hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = hh(a, b, c, d, words[i + 9], 4, -640364487);
    d = hh(d, a, b, c, words[i + 12], 11, -421815835);
    c = hh(c, d, a, b, words[i + 15], 16, 530742520);
    b = hh(b, c, d, a, words[i + 2], 23, -995338651);

    a = ii(a, b, c, d, words[i], 6, -198630844);
    d = ii(d, a, b, c, words[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = ii(a, b, c, d, words[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10], 15, -1051523);
    b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15], 10, -30611744);
    c = ii(c, d, a, b, words[i + 6], 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4], 6, -145523070);
    d = ii(d, a, b, c, words[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2], 15, 718787259);
    b = ii(b, c, d, a, words[i + 9], 21, -343485551);

    a = add(a, olda);
    b = add(b, oldb);
    c = add(c, oldc);
    d = add(d, oldd);
  }

  return [a, b, c, d]
    .map((value) => {
      let output = '';
      for (let i = 0; i < 4; i += 1) {
        output += `0${((value >> (i * 8)) & 255).toString(16)}`.slice(-2);
      }
      return output;
    })
    .join('');
};

const nameHash = (value: string) =>
  Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);

const getInitials = (user?: User | null) => {
  const source = (user?.name || user?.email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toLocaleUpperCase();
  return source.slice(0, 2).toLocaleUpperCase();
};

export function ProfileAvatar({ user, size = 'md', className = '' }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const displayName = user?.name || user?.email || 'User';
  const email = user?.email?.trim().toLocaleLowerCase();
  const background = palette[nameHash(displayName) % palette.length];
  const gravatarUrl = useMemo(
    () => (email ? `https://www.gravatar.com/avatar/${md5(email)}?s=96&d=404` : ''),
    [email],
  );

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold uppercase text-white shadow-sm ring-1 ring-white/30 ${avatarSizes[size]} ${className}`}
      style={{ backgroundColor: background }}
      aria-hidden="true"
    >
      {gravatarUrl && !failed ? (
        <img
          src={gravatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        getInitials(user)
      )}
    </span>
  );
}

export default function AccountAvatarMenu({
  className = '',
  labelClassName = 'text-sm font-medium',
  placement = 'bottom-end',
  label,
  showLabel = false,
  avatarSize = 'md',
}: AccountAvatarMenuProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const user = useSelector((state: any) => state.session.user) as User | null;
  const [open, setOpen] = useState(false);

  const handleLogout: MouseEventHandler<HTMLButtonElement> = async () => {
    setOpen(false);
    if (!user) return;

    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes?.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((token: string) => token !== notificationToken).join(',')
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    dispatch(sessionActions.updateUser(null));
    navigate(routes.login);
  };

  if (!user) return null;

  const profileHref = routes.settings.user.detail(user.id);
  const accessibleName = label || user.name || user.email || t('settingsUser');

  return (
    <FloatingPanel
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      className="w-64"
      trigger={(props, ref) => (
        <button
          {...props}
          ref={ref as any}
          type="button"
          className={`inline-flex min-w-0 items-center gap-2 rounded-full transition hover:bg-(--color-surface-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${showLabel ? 'px-2 py-1.5' : 'p-1'} ${className}`}
          aria-label={`Open account menu for ${accessibleName}`}
        >
          <ProfileAvatar user={user} size={avatarSize} />
          {showLabel && (
            <span className={`min-w-0 truncate pr-1 ${labelClassName}`}>
              {label || user.name || t('settingsUser')}
            </span>
          )}
        </button>
      )}
    >
      <div className="flex items-center gap-3 border-b border-(--color-divider) px-2 pb-3 pt-1">
        <ProfileAvatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name || t('settingsUser')}</p>
          {user.email && (
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-xs text-(--color-muted)">
              <Mail size={13} />
              <span className="truncate">{user.email}</span>
            </p>
          )}
        </div>
      </div>
      <div className="pt-2">
        <Link
          href={profileHref}
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-(--color-surface-hover)"
          role="menuitem"
        >
          <UserRound size={17} />
          {t('settingsUser')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          role="menuitem"
        >
          <LogOut size={17} />
          {t('loginLogout')}
        </button>
      </div>
    </FloatingPanel>
  );
}

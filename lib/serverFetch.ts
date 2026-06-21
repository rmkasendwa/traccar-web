import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export const getRequestOrigin = async () => {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  if (!host) {
    return null;
  }
  const protocol = requestHeaders.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
};

export const getRequestCookieHeader = async () => {
  const requestHeaders = await headers();
  return requestHeaders.get('cookie') || '';
};

export const fetchFromRequestOrigin = async (
  path: string,
  init: Parameters<typeof fetch>[1] = {},
) => {
  const origin = await getRequestOrigin();
  if (!origin) {
    return null;
  }
  const cookie = await getRequestCookieHeader();
  return fetch(`${origin}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(cookie ? { cookie } : {}),
      ...init.headers,
    },
  });
};

const splitSetCookieHeader = (value: string) => {
  const cookiesList: string[] = [];
  let start = 0;
  let inExpires = false;

  for (let index = 0; index < value.length; index += 1) {
    const part = value.slice(index, index + 8).toLowerCase();
    if (part === 'expires=') {
      inExpires = true;
    }
    if (inExpires && value[index] === ';') {
      inExpires = false;
    }
    if (!inExpires && value[index] === ',') {
      cookiesList.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }

  cookiesList.push(value.slice(start).trim());
  return cookiesList.filter(Boolean);
};

export const applyResponseCookies = async (response: Response) => {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    return;
  }

  const cookieStore = await cookies();
  splitSetCookieHeader(setCookie).forEach((cookieHeader) => {
    const [nameValue, ...attributes] = cookieHeader.split(';').map((part) => part.trim());
    const separator = nameValue.indexOf('=');
    if (separator < 1) {
      return;
    }

    const options: Record<string, string | boolean | number | Date> = {};
    attributes.forEach((attribute) => {
      const [rawKey, rawValue] = attribute.split('=');
      const key = rawKey.toLowerCase();
      if (key === 'httponly') options.httpOnly = true;
      if (key === 'secure') options.secure = true;
      if (key === 'path' && rawValue) options.path = rawValue;
      if (key === 'domain' && rawValue) options.domain = rawValue;
      if (key === 'max-age' && rawValue) options.maxAge = Number(rawValue);
      if (key === 'expires' && rawValue) options.expires = new Date(rawValue);
      if (key === 'samesite' && rawValue) options.sameSite = rawValue.toLowerCase();
    });

    cookieStore.set(nameValue.slice(0, separator), nameValue.slice(separator + 1), options);
  });
};

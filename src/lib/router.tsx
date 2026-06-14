'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import { forwardRef, useCallback, useMemo, type AnchorHTMLAttributes } from 'react';

type NavigateOptions = {
  replace?: boolean;
};

type SearchParamsInput = URLSearchParams | Record<string, string> | string;

export const useNavigate = () => {
  const router = useRouter();

  return useCallback(
    (target: string | number, options: NavigateOptions = {}) => {
      if (typeof target === 'number') {
        if (target < 0) {
          router.back();
        } else if (target > 0) {
          router.forward();
        }
        return;
      }

      if (options.replace) {
        router.replace(target);
      } else {
        router.push(target);
      }
    },
    [router],
  );
};

export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();

  return useMemo(
    () => ({
      pathname,
      search: searchParams.size ? `?${searchParams.toString()}` : '',
    }),
    [pathname, searchParams],
  );
};

export const useParams = <T extends Record<string, string>>() => useNextParams<T>();

export const useSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const readonlyParams = useNextSearchParams();
  const params = useMemo(() => new URLSearchParams(readonlyParams.toString()), [readonlyParams]);

  const setSearchParams = useCallback(
    (next: SearchParamsInput, options = {}) => {
      const query = new URLSearchParams(next).toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if ((options as NavigateOptions).replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [pathname, router],
  );

  return [params, setSearchParams] as const;
};

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<NextLinkProps, 'href'> & {
    to?: string;
    href?: string;
  };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, href, ...props }, ref) => (
  <NextLink ref={ref} href={href ?? to ?? '/'} {...props} />
));
Link.displayName = 'Link';

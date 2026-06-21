import type { ReactNode } from 'react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <div className="flex min-h-dvh w-full flex-col md:flex-row">
        <aside className="flex bg-blue-950 p-6 text-white md:basis-[44%] md:flex-col md:justify-between md:p-12 lg:basis-[40%]">
          <span
            role="img"
            aria-label="Traccar"
            className="block h-14 w-52 max-w-full bg-white [mask:url('/logo-wordmark.svg')_center/contain_no-repeat] [-webkit-mask:url('/logo-wordmark.svg')_center/contain_no-repeat]"
          />
          <div className="hidden max-w-md md:block">
            <p className="text-xs font-bold uppercase text-white/70">
              Fleet visibility starts here
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Secure access to your workspace.
            </h1>
            <p className="mt-4 leading-7 text-white/75">
              Sign in, create an account, or recover access with a focused experience that works on
              every screen.
            </p>
          </div>
        </aside>
        <section className="flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-[464px] rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

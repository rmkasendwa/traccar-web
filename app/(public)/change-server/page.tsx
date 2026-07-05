import { redirect } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { getRequestOrigin } from '@/lib/serverFetch';

type ChangeServerPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const changeServer = async (formData: FormData) => {
  'use server';

  const server = String(formData.get('server') || '').trim();
  try {
    const parsed = new URL(server);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      redirect('/change-server?error=url');
    }
    redirect(parsed.toString());
  } catch {
    redirect('/change-server?error=url');
  }
};

export default async function Page({ searchParams }: ChangeServerPageProps) {
  const { error } = await searchParams;
  const currentServer = (await getRequestOrigin()) || 'http://localhost:3000';
  const servers = [
    currentServer,
    'https://demo.traccar.org',
    'https://demo2.traccar.org',
    'https://demo3.traccar.org',
    'https://demo4.traccar.org',
    'https://server.traccar.org',
    'http://localhost:8082',
    'http://localhost:3000',
  ].filter((value, index, self) => self.indexOf(value) === index);

  return (
    <AuthShell
      titleKey="settingsServer"
      subtitle="Connect this client to a different Traccar server."
    >
      <form action={changeServer} className="flex flex-col gap-4" noValidate>
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            Enter a full server URL starting with http:// or https://.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-(--color-muted)">
          <span>
            Server <span className="font-bold text-red-600">*</span>
          </span>
          <input
            className="min-h-11 rounded-md border border-(--color-divider) bg-(--color-paper) px-3 py-2 text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            name="server"
            defaultValue={currentServer}
            list="servers"
            required
          />
          <datalist id="servers">
            {servers.map((server) => (
              <option key={server} value={server} />
            ))}
          </datalist>
          <span className="text-xs text-(--color-muted)">Example: https://server.example.com</span>
        </label>

        <button className="min-h-11 rounded-md bg-blue-900 px-4 font-medium text-white hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-(--color-paper)">
          Save server
        </button>
      </form>
    </AuthShell>
  );
}

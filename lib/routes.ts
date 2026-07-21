type QueryValue = string | number | boolean | null | undefined;

const withQuery = (path: string, query: Record<string, QueryValue>) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value != null) {
      searchParams.set(key, String(value));
    }
  });

  const search = searchParams.toString();
  return search ? `${path}?${search}` : path;
};

const settingsItem = (type: string, id: string | number) => `/settings/${type}/${id}`;

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  resetPassword: '/reset-password',
  changeServer: '/change-server',
  emulator: '/emulator',
  replay: {
    index: '/replay',
    forDevice: (deviceId: string | number) => withQuery('/replay', { deviceId }),
  },
  stream: {
    index: '/stream',
    forDevice: (deviceId: string | number) => withQuery('/stream', { deviceId }),
  },
  position: (id: string | number) => `/position/${id}`,
  network: (positionId: string | number) => `/network/${positionId}`,
  event: (id: string | number) => `/event/${id}`,
  geofences: '/geofences',
  reports: {
    index: '/reports',
    combined: '/reports/combined',
    combinedForDevice: (deviceId?: string | number | null) =>
      withQuery('/reports/combined', { deviceId }),
    summary: '/reports/summary',
    chart: '/reports/chart',
    trips: '/reports/trips',
    stops: '/reports/stops',
    route: '/reports/route',
    events: '/reports/events',
    geofences: '/reports/geofences',
    logs: '/reports/logs',
    scheduled: '/reports/scheduled',
    statistics: '/reports/statistics',
    audit: '/reports/audit',
  },
  settings: {
    index: '/settings',
    preferences: '/settings/preferences',
    preferencesMenu: '/settings/preferences?menu=true',
    announcement: '/settings/announcement',
    server: '/settings/server',
    users: '/settings/users',
    user: {
      base: '/settings/user',
      detail: (id: string | number) => settingsItem('user', id),
      connections: (id: string | number) => `${settingsItem('user', id)}/connections`,
      withQuery: (id: string | number, query: URLSearchParams) =>
        withQuery(settingsItem('user', id), Object.fromEntries(query)),
    },
    devices: '/settings/devices',
    device: {
      base: '/settings/device',
      detail: (id: string | number) => settingsItem('device', id),
      command: (id: string | number) => `${settingsItem('device', id)}/command`,
      connections: (id: string | number) => `${settingsItem('device', id)}/connections`,
      share: (id: string | number) => `${settingsItem('device', id)}/share`,
      withQuery: (query: URLSearchParams) =>
        withQuery('/settings/device', Object.fromEntries(query)),
    },
    groups: '/settings/groups',
    group: {
      base: '/settings/group',
      command: (id: string | number) => `${settingsItem('group', id)}/command`,
      connections: (id: string | number) => `${settingsItem('group', id)}/connections`,
      share: (id: string | number) => `${settingsItem('group', id)}/share`,
    },
    geofence: {
      base: '/settings/geofence',
      detail: (id: string | number) => settingsItem('geofence', id),
    },
    notifications: '/settings/notifications',
    notification: { base: '/settings/notification' },
    drivers: '/settings/drivers',
    driver: { base: '/settings/driver' },
    calendars: '/settings/calendars',
    calendar: { base: '/settings/calendar' },
    attributes: '/settings/attributes',
    attribute: { base: '/settings/attribute' },
    maintenances: '/settings/maintenances',
    maintenance: { base: '/settings/maintenance' },
    commands: '/settings/commands',
    command: { base: '/settings/command' },
    accumulators: (deviceId: string | number) => `/settings/accumulators/${deviceId}`,
  },
} as const;

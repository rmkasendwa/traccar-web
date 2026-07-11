import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiId, Position, Server, User } from '@/types/traccar';

type RoutePoint = [number, number];

type SessionState = {
  server: Server | null;
  user: User | null;
  socket: WebSocket | null;
  includeLogs: boolean;
  logs: unknown[];
  positions: Record<ApiId, Position>;
  history: Record<ApiId, RoutePoint[]>;
};

const initialState: SessionState = {
  server: null,
  user: null,
  socket: null,
  includeLogs: false,
  logs: [],
  positions: {},
  history: {},
};

const getAttribute = (user: User | null, server: Server | null, key: string) =>
  user?.attributes?.[key] ?? server?.attributes?.[key];

const { reducer, actions } = createSlice({
  name: 'session',
  initialState,
  reducers: {
    updateServer(state, action: PayloadAction<Server>) {
      state.server = action.payload;
    },
    updateUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    updateSocket(state, action: PayloadAction<WebSocket | null>) {
      state.socket = action.payload;
    },
    enableLogs(state, action: PayloadAction<boolean>) {
      state.includeLogs = action.payload;
      if (!action.payload) {
        state.logs = [];
      }
    },
    updateLogs(state, action: PayloadAction<unknown[]>) {
      state.logs.push(...action.payload);
    },
    updatePositions(state, action: PayloadAction<Position[]>) {
      const liveRoutes = getAttribute(state.user, state.server, 'mapLiveRoutes') || 'none';
      const rawLiveRoutesLimit = getAttribute(state.user, state.server, 'web.liveRouteLength');
      const liveRoutesLimit =
        typeof rawLiveRoutesLimit === 'number' || typeof rawLiveRoutesLimit === 'string'
          ? Number(rawLiveRoutesLimit)
          : 10;
      action.payload.forEach((position) => {
        if (
          position.deviceId === undefined ||
          position.longitude === undefined ||
          position.latitude === undefined
        ) {
          return;
        }
        state.positions[position.deviceId] = position;
        if (liveRoutes !== 'none') {
          const route = state.history[position.deviceId] || [];
          const last = route.at(-1);
          if (!last || (last[0] !== position.longitude && last[1] !== position.latitude)) {
            state.history[position.deviceId] = [
              ...route.slice(1 - liveRoutesLimit),
              [position.longitude, position.latitude],
            ];
          }
        } else {
          state.history = {};
        }
      });
    },
  },
});

export { actions as sessionActions };
export { reducer as sessionReducer };

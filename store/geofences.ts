import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiId, Geofence } from '@/types/traccar';

type GeofencesState = {
  items: Record<ApiId, Geofence>;
};

const initialState: GeofencesState = {
  items: {},
};

const { reducer, actions } = createSlice({
  name: 'geofences',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Geofence[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
    update(state, action: PayloadAction<Geofence[]>) {
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
  },
});

export { actions as geofencesActions };
export { reducer as geofencesReducer };

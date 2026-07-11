import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiId, Maintenance } from '@/types/traccar';

type MaintenancesState = {
  items: Record<ApiId, Maintenance>;
};

const initialState: MaintenancesState = {
  items: {},
};

const { reducer, actions } = createSlice({
  name: 'maintenances',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Maintenance[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
  },
});

export { actions as maintenancesActions };
export { reducer as maintenancesReducer };

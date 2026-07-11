import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Driver } from '@/types/traccar';

type DriversState = {
  items: Record<string, Driver>;
};

const initialState: DriversState = {
  items: {},
};

const { reducer, actions } = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Driver[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        if (item.uniqueId) state.items[item.uniqueId] = item;
      });
    },
  },
});

export { actions as driversActions };
export { reducer as driversReducer };

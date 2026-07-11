import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiId, Device } from '@/types/traccar';

type DevicesState = {
  items: Record<ApiId, Device>;
  selectedId: ApiId | null;
  selectTime?: number;
};

const initialState: DevicesState = {
  items: {},
  selectedId: null,
};

const { reducer, actions } = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Device[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
    update(state, action: PayloadAction<Device[]>) {
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
    selectId(state, action: PayloadAction<ApiId | null>) {
      state.selectTime = Date.now();
      state.selectedId = action.payload;
    },
    remove(state, action: PayloadAction<ApiId>) {
      delete state.items[action.payload];
    },
  },
});

export { actions as devicesActions };
export { reducer as devicesReducer };

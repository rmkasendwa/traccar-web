import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiId, Calendar } from '@/types/traccar';

type CalendarsState = {
  items: Record<ApiId, Calendar>;
};

const initialState: CalendarsState = {
  items: {},
};

const { reducer, actions } = createSlice({
  name: 'calendars',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Calendar[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
  },
});

export { actions as calendarsActions };
export { reducer as calendarsReducer };

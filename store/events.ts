import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Event } from '@/types/traccar';

type EventsState = {
  items: Event[];
};

const initialState: EventsState = {
  items: [],
};

const { reducer, actions } = createSlice({
  name: 'events',
  initialState,
  reducers: {
    add(state, action: PayloadAction<Event[]>) {
      state.items.unshift(...action.payload);
      state.items.splice(50);
    },
    delete(state, action: PayloadAction<Event>) {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    deleteAll(state) {
      state.items = [];
    },
  },
});

export { actions as eventsActions };
export { reducer as eventsReducer };

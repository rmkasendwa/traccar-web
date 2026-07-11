import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ApiId, Group } from '@/types/traccar';

type GroupsState = {
  items: Record<ApiId, Group>;
};

const initialState: GroupsState = {
  items: {},
};

const { reducer, actions } = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    refresh(state, action: PayloadAction<Group[]>) {
      state.items = {};
      action.payload.forEach((item) => {
        if (item.id !== undefined) state.items[item.id] = item;
      });
    },
  },
});

export { actions as groupsActions };
export { reducer as groupsReducer };

// @ts-nocheck
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { errorsReducer as errors } from '@/store/errors';
import { sessionReducer as session } from '@/store/session';
import { devicesReducer as devices } from '@/store/devices';
import { eventsReducer as events } from '@/store/events';
import { motionReducer as motion } from '@/store/motion';
import { geofencesReducer as geofences } from '@/store/geofences';
import { groupsReducer as groups } from '@/store/groups';
import { driversReducer as drivers } from '@/store/drivers';
import { maintenancesReducer as maintenances } from '@/store/maintenances';
import { calendarsReducer as calendars } from '@/store/calendars';
import throttleMiddleware from '@/store/throttleMiddleware';

const reducer = combineReducers({
  errors,
  session,
  devices,
  events,
  motion,
  geofences,
  groups,
  drivers,
  maintenances,
  calendars,
});

export { errorsActions } from '@/store/errors';
export { sessionActions } from '@/store/session';
export { devicesActions } from '@/store/devices';
export { eventsActions } from '@/store/events';
export { motionActions } from '@/store/motion';
export { geofencesActions } from '@/store/geofences';
export { groupsActions } from '@/store/groups';
export { driversActions } from '@/store/drivers';
export { maintenancesActions } from '@/store/maintenances';
export { calendarsActions } from '@/store/calendars';

export default configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(throttleMiddleware),
});

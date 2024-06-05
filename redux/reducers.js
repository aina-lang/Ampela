// reducers.js

import { combineReducers } from 'redux';
import {
  TOGGLE_MENSTRUATION_NOTIFICATIONS,
  TOGGLE_OVULATION_NOTIFICATIONS,
  TOGGLE_PILL_NOTIFICATIONS,
} from './actionTypes';

const menstruationNotificationsReducer = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_MENSTRUATION_NOTIFICATIONS:
      return !state;
    default:
      return state;
  }
};

const ovulationNotificationsReducer = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_OVULATION_NOTIFICATIONS:
      return !state;
    default:
      return state;
  }
};

const pillNotificationsReducer = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_PILL_NOTIFICATIONS:
      return !state;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  menstruationNotifications: menstruationNotificationsReducer,
  ovulationNotifications: ovulationNotificationsReducer,
  pillNotifications: pillNotificationsReducer,
});

export default rootReducer;

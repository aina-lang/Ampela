// actions.js
import {
  SCHEDULE_MENSTRUATION_NOTIFICATIONS,
  SCHEDULE_OVULATION_NOTIFICATIONS,
  SCHEDULE_PILL_NOTIFICATIONS,
} from "./actionsType";

export const scheduleMenstruationNotifications = () => ({
  type: SCHEDULE_MENSTRUATION_NOTIFICATIONS,
});

export const scheduleOvulationNotifications = () => ({
  type: SCHEDULE_OVULATION_NOTIFICATIONS,
});

export const schedulePillNotifications = () => ({
  type: SCHEDULE_PILL_NOTIFICATIONS,
});

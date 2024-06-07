import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cycleMenstruelSlice from "./cycleSlice";
import reminderReducer from "./notificationSlice";
import preferenceReducer from "./preferenceSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    cycleMenstruel: cycleMenstruelSlice,
    reminder: reminderReducer,
    preference: preferenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["cycleMenstruel.cyclesData"],
      },
    }),
});

export default store;

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cycleMenstruelSlice from "./cycleSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    cycleMenstruel: cycleMenstruelSlice,
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

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cycleMenstruelSlice from "./cycleSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    cycleMenstruel: cycleMenstruelSlice,
  },
});

export default store;

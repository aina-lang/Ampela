// // reminderSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// export const reminderSlice = createSlice({
//   name: 'reminder',
//   initialState: {
//     menstruationNotifications: false,
//     ovulationNotifications: false,
//     pillNotifications: false,
//   },
//   reducers: {
//     toggleMenstruationNotifications: (state) => {
//       state.menstruationNotifications = !state.menstruationNotifications;
//     },
//     toggleOvulationNotifications: (state) => {
//       state.ovulationNotifications = !state.ovulationNotifications;
//     },
//     togglePillNotifications: (state) => {
//       state.pillNotifications = !state.pillNotifications;
//     },
//   },
// });

// export const {
//   toggleMenstruationNotifications,
//   toggleOvulationNotifications,
//   togglePillNotifications,
// } = reminderSlice.actions;

// export default reminderSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

export const reminderSlice = createSlice({
  name: "reminder",
  initialState: {
    menstruationNotifications: false,
    ovulationNotifications: false,
    pillNotifications: false,
  },
  reducers: {
    toggleMenstruationNotifications: (state) => {
      state.menstruationNotifications = !state.menstruationNotifications;
    },
    toggleOvulationNotifications: (state) => {
      state.ovulationNotifications = !state.ovulationNotifications;
    },
    togglePillNotifications: (state) => {
      state.pillNotifications = !state.pillNotifications;
    },
  },
});

export const {
  toggleMenstruationNotifications,
  toggleOvulationNotifications,
  togglePillNotifications,
} = reminderSlice.actions;

export default reminderSlice.reducer;

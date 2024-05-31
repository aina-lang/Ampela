import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  lastMenstruationDate: null,
  cycleDuration: null,
  menstruationDuration: null,
  cyclesData: [],
};

const cycleMenstruelSlice = createSlice({
  name: "cycleMenstruel",
  initialState,
  reducers: {
    updateCycleMenstruelData: (state, action) => {
      state.cyclesData = action.payload;
    },
  },
});

export const { updateCycleMenstruelData } = cycleMenstruelSlice.actions;

export default cycleMenstruelSlice.reducer;

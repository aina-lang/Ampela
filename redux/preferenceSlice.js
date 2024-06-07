import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "",
  language: "",
};

const preferenceSlice = createSlice({
  name: "preference",
  initialState,
  reducers: {
    updatePreference: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updatePreference } = preferenceSlice.actions;

export default preferenceSlice.reducer;

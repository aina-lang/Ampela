import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  username: "",
  password: "",
  profession: "",
  lastMenstruationDate: null,
  durationMenstruation: null,
  cycleDuration: null,
  email: "",
  profileImage: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;

// otpSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null,
};

const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    setEmailForOtp: (state, action) => {
      state.email = action.payload;
    },
    clearEmail: (state) => {
      state.email = null;
    },
  },
});

export const { setEmailForOtp, clearEmail } = otpSlice.actions;
export default otpSlice.reducer;

// store.js
import { configureStore } from "@reduxjs/toolkit";
import { dengueApi } from "../api/dengueApi.js";
import otpReducer from "../features/otpSlice.js";

export const store = configureStore({
  reducer: {
    [dengueApi.reducerPath]: dengueApi.reducer,
    otp: otpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dengueApi.middleware),
});

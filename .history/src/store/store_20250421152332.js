// store.js
import { configureStore } from "@reduxjs/toolkit";
import { dengueApi } from "../api/dengueApi";
import otpReducer from "../features/otpSlice";

export const store = configureStore({
  reducer: {
    [dengueApi.reducerPath]: dengueApi.reducer,
    otp: otpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dengueApi.middleware),
});

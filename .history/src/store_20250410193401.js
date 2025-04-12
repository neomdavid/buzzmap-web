import { configureStore } from "@reduxjs/toolkit";
import { dengueApi } from "./api/dengueApi";

export const store = configureStore({
  reducer: {
    [dengueApi.reducerPath]: dengueApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dengueApi.middleware),
});

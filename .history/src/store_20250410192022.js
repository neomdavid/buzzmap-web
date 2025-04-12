import { configureStore } from "@reduxjs/toolkit";
import { dengueApi } from "../services/dengueApi";

export const store = configureStore({
  reducer: {
    [dengueApi.reducerPath]: dengueApi.reducer,
  },
});

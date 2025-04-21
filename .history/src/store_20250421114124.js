import { configureStore } from "@reduxjs/toolkit";
import { dengueApi } from "./api/dengueApi";
// import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [dengueApi.reducerPath]: dengueApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dengueApi.middleware),
});

// setupListeners(store.dispatch);

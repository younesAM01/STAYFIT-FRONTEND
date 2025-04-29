// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { packApi } from "./services/pack.service";
import { clientPackApi } from "./services/clientpack.service";
import { userApi } from "./services/user.service";
export const store = configureStore({
  reducer: {
    [packApi.reducerPath]: packApi.reducer,
    [clientPackApi.reducerPath]: clientPackApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      packApi.middleware,
      clientPackApi.middleware,
      userApi.middleware,
      couponApi.middleware,
      reviewApi.middleware,
      serviceApi.middleware,
      sessionApi.middleware
      
    ),
});
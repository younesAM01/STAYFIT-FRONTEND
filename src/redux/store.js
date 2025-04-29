// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { packApi } from "./services/pack.service";
import { clientPackApi } from "./services/clientpack.service";
import { userApi } from "./services/user.service";
import { couponApi } from "./services/coupon.service";
import { reviewApi } from "./services/review.service";
import { servicesApi } from "./services/services.service";
import { sessionApi } from "./services/session.service";


export const store = configureStore({
  reducer: {
    [packApi.reducerPath]: packApi.reducer,
    [clientPackApi.reducerPath]: clientPackApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [sessionApi.reducerPath]: sessionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      packApi.middleware,
      clientPackApi.middleware,
      userApi.middleware,
      couponApi.middleware,
      reviewApi.middleware,
      servicesApi.middleware,
      sessionApi.middleware
      
    ),
});

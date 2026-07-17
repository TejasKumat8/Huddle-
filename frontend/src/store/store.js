import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import huddleReducer from "./huddleSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    huddles: huddleReducer,
  },
});

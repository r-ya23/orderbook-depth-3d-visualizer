import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import orderbookReducer from "@/store/orderbookslice"
import filtersReducer from "@/store/filterslice";
import settingsReducer from "@/store/settingslice";
import analyticsReducer from "@/store/analyticsslice";

export const store = configureStore({
  reducer: {
    orderbook: orderbookReducer,
    filters: filtersReducer,
    settings: settingsReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Three.js objects
        ignoredActions: [
          "settings/updateCameraSettings",
          "orderbook/updateSnapshot",
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["settings.camera.position", "settings.camera.target"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

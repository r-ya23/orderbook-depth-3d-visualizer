import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OrderbookState,
  OrderbookSnapshot,
  OrderbookUpdate,
  AggregatedOrderbook,
  OrderbookMetrics,
  PressureZone,
} from "@/types/orderbook";
import { VenueId } from "@/types/venue";

const initialState: OrderbookState = {
  snapshot: null,
  isConnected: false,
  isLoading: false,
  error: null,
  lastUpdate: 0,
  metrics: null,
  pressureZones: [],
  selectedVenues: ["binance"], // Default venues
  updateCount: 0,
};

const orderbookSlice = createSlice({
  name: "orderbook",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.error = "Connection lost";
      } else {
        state.error = null;
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isConnected = false;
      }
    },

    updateSnapshot: (state, action: PayloadAction<AggregatedOrderbook>) => {
      state.snapshot = action.payload;
      state.lastUpdate = Date.now();
      state.updateCount += 1;
      state.error = null;
    },

    updateMetrics: (state, action: PayloadAction<OrderbookMetrics>) => {
      state.metrics = action.payload;
    },

    updatePressureZones: (state, action: PayloadAction<PressureZone[]>) => {
      state.pressureZones = action.payload;
    },

    setSelectedVenues: (state, action: PayloadAction<VenueId[]>) => {
      state.selectedVenues = action.payload;
    },

    toggleVenue: (state, action: PayloadAction<VenueId>) => {
      const venue = action.payload;
      const index = state.selectedVenues.indexOf(venue);

      if (index > -1) {
        // Remove venue if it exists
        state.selectedVenues.splice(index, 1);
      } else {
        // Add venue if it doesn't exist
        state.selectedVenues.push(venue);
      }
    },

    clearOrderbook: (state) => {
      state.snapshot = null;
      state.metrics = null;
      state.pressureZones = [];
      state.updateCount = 0;
      state.lastUpdate = 0;
    },

    resetConnection: (state) => {
      state.isConnected = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setConnected,
  setError,
  updateSnapshot,
  updateMetrics,
  updatePressureZones,
  setSelectedVenues,
  toggleVenue,
  clearOrderbook,
  resetConnection,
} = orderbookSlice.actions;

export default orderbookSlice.reducer;

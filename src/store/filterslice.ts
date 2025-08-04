import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VenueId } from "@/types/venue";

interface FiltersState {
  priceRange: {
    min: number;
    max: number;
    enabled: boolean;
  };
  quantityThreshold: {
    min: number;
    enabled: boolean;
  };
  timeRange: {
    duration: number; // in milliseconds
    type: "1m" | "5m" | "15m" | "1h" | "custom";
  };
  venues: {
    [key in VenueId]: {
      enabled: boolean;
      opacity: number;
    };
  };
  visualization: {
    showBids: boolean;
    showAsks: boolean;
    showPressureZones: boolean;
    showVolumeProfile: boolean;
    showOrderFlow: boolean;
  };
  search: {
    priceLevel: number | null;
    venue: VenueId | null;
  };
}

const initialState: FiltersState = {
  priceRange: {
    min: 0,
    max: 100000,
    enabled: false,
  },
  quantityThreshold: {
    min: 0,
    enabled: false,
  },
  timeRange: {
    duration: 5 * 60 * 1000, // 5 minutes
    type: "5m",
  },
  venues: {
    binance: { enabled: false, opacity: 1 },
    okx: { enabled: true, opacity: 1 },
    bybit: { enabled: false, opacity: 1 },
    deribit: { enabled: false, opacity: 1 },
  },
  visualization: {
    showBids: true,
    showAsks: true,
    showPressureZones: true,
    showVolumeProfile: false,
    showOrderFlow: false,
  },
  search: {
    priceLevel: null,
    venue: null,
  },
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setPriceRange: (
      state,
      action: PayloadAction<{ min: number; max: number }>
    ) => {
      state.priceRange.min = action.payload.min;
      state.priceRange.max = action.payload.max;
    },

    togglePriceRangeFilter: (state) => {
      state.priceRange.enabled = !state.priceRange.enabled;
    },

    setQuantityThreshold: (state, action: PayloadAction<number>) => {
      state.quantityThreshold.min = action.payload;
    },

    toggleQuantityFilter: (state) => {
      state.quantityThreshold.enabled = !state.quantityThreshold.enabled;
    },

    setTimeRange: (
      state,
      action: PayloadAction<{
        duration: number;
        type: "1m" | "5m" | "15m" | "1h" | "custom";
      }>
    ) => {
      state.timeRange = action.payload;
    },

    toggleVenue: (state, action: PayloadAction<VenueId>) => {
      const venue = action.payload;
      state.venues[venue].enabled = !state.venues[venue].enabled;
    },

    setVenueOpacity: (
      state,
      action: PayloadAction<{ venue: VenueId; opacity: number }>
    ) => {
      const { venue, opacity } = action.payload;
      state.venues[venue].opacity = Math.max(0, Math.min(1, opacity));
    },

    toggleBids: (state) => {
      state.visualization.showBids = !state.visualization.showBids;
    },

    toggleAsks: (state) => {
      state.visualization.showAsks = !state.visualization.showAsks;
    },

    togglePressureZones: (state) => {
      state.visualization.showPressureZones =
        !state.visualization.showPressureZones;
    },

    toggleVolumeProfile: (state) => {
      state.visualization.showVolumeProfile =
        !state.visualization.showVolumeProfile;
    },

    toggleOrderFlow: (state) => {
      state.visualization.showOrderFlow = !state.visualization.showOrderFlow;
    },

    setSearchPriceLevel: (state, action: PayloadAction<number | null>) => {
      state.search.priceLevel = action.payload;
    },

    setSearchVenue: (state, action: PayloadAction<VenueId | null>) => {
      state.search.venue = action.payload;
    },

    resetFilters: (state) => {
      return initialState;
    },

    resetVisualizationFilters: (state) => {
      state.visualization = initialState.visualization;
    },
  },
});

export const {
  setPriceRange,
  togglePriceRangeFilter,
  setQuantityThreshold,
  toggleQuantityFilter,
  setTimeRange,
  toggleVenue,
  setVenueOpacity,
  toggleBids,
  toggleAsks,
  togglePressureZones,
  toggleVolumeProfile,
  toggleOrderFlow,
  setSearchPriceLevel,
  setSearchVenue,
  resetFilters,
  resetVisualizationFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

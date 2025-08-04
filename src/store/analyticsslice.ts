import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SpreadData {
  timestamp: number;
  spread: number;
  spreadPercentage: number;
  bidPrice: number;
  askPrice: number;
}

interface ImbalanceData {
  timestamp: number;
  bidVolume: number;
  askVolume: number;
  imbalance: number; // bid/ask ratio
  imbalancePercentage: number;
}

interface VolumeProfileLevel {
  price: number;
  volume: number;
  percentage: number;
}

interface AnalyticsState {
  spread: {
    current: SpreadData | null;
    history: SpreadData[];
    average: number;
    min: number;
    max: number;
  };
  imbalance: {
    current: ImbalanceData | null;
    history: ImbalanceData[];
    trend: "bullish" | "bearish" | "neutral";
  };
  volumeProfile: {
    levels: VolumeProfileLevel[];
    totalVolume: number;
    maxVolumePrice: number;
    lastUpdate: number;
  };
  pressureZoneStats: {
    supportLevels: number[];
    resistanceLevels: number[];
    strongestSupport: number | null;
    strongestResistance: number | null;
  };
  performance: {
    fps: number;
    renderTime: number;
    memoryUsage: number;
    particleCount: number;
    updateLatency: number;
  };
  alerts: Array<{
    id: string;
    type: "spread" | "imbalance" | "pressure" | "volume";
    message: string;
    timestamp: number;
    severity: "low" | "medium" | "high";
    acknowledged: boolean;
  }>;
}

const initialState: AnalyticsState = {
  spread: {
    current: null,
    history: [],
    average: 0,
    min: 0,
    max: 0,
  },
  imbalance: {
    current: null,
    history: [],
    trend: "neutral",
  },
  volumeProfile: {
    levels: [],
    totalVolume: 0,
    maxVolumePrice: 0,
    lastUpdate: 0,
  },
  pressureZoneStats: {
    supportLevels: [],
    resistanceLevels: [],
    strongestSupport: null,
    strongestResistance: null,
  },
  performance: {
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    particleCount: 0,
    updateLatency: 0,
  },
  alerts: [],
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    updateSpreadData: (state, action: PayloadAction<SpreadData>) => {
      state.spread.current = action.payload;
      state.spread.history.push(action.payload);

      // Keep only last 1000 data points
      if (state.spread.history.length > 1000) {
        state.spread.history = state.spread.history.slice(-1000);
      }

      // Update statistics
      const spreads = state.spread.history.map((d) => d.spread);
      state.spread.average =
        spreads.reduce((a, b) => a + b, 0) / spreads.length;
      state.spread.min = Math.min(...spreads);
      state.spread.max = Math.max(...spreads);
    },

    updateImbalanceData: (state, action: PayloadAction<ImbalanceData>) => {
      state.imbalance.current = action.payload;
      state.imbalance.history.push(action.payload);

      // Keep only last 1000 data points
      if (state.imbalance.history.length > 1000) {
        state.imbalance.history = state.imbalance.history.slice(-1000);
      }

      // Update trend
      const { imbalance } = action.payload;
      if (imbalance > 1.1) {
        state.imbalance.trend = "bullish";
      } else if (imbalance < 0.9) {
        state.imbalance.trend = "bearish";
      } else {
        state.imbalance.trend = "neutral";
      }
    },

    updateVolumeProfile: (
      state,
      action: PayloadAction<VolumeProfileLevel[]>
    ) => {
      state.volumeProfile.levels = action.payload;
      state.volumeProfile.totalVolume = action.payload.reduce(
        (sum, level) => sum + level.volume,
        0
      );

      // Find price with maximum volume
      const maxVolumeLevel = action.payload.reduce(
        (max, level) => (level.volume > max.volume ? level : max),
        action.payload[0] || { price: 0, volume: 0, percentage: 0 }
      );
      state.volumeProfile.maxVolumePrice = maxVolumeLevel.price;
      state.volumeProfile.lastUpdate = Date.now();
    },

    updatePressureZoneStats: (
      state,
      action: PayloadAction<{
        supportLevels: number[];
        resistanceLevels: number[];
      }>
    ) => {
      state.pressureZoneStats.supportLevels = action.payload.supportLevels;
      state.pressureZoneStats.resistanceLevels =
        action.payload.resistanceLevels;

      // Find strongest levels (highest volume/concentration)
      state.pressureZoneStats.strongestSupport =
        action.payload.supportLevels[0] || null;
      state.pressureZoneStats.strongestResistance =
        action.payload.resistanceLevels[0] || null;
    },

    updatePerformanceStats: (
      state,
      action: PayloadAction<Partial<AnalyticsState["performance"]>>
    ) => {
      state.performance = { ...state.performance, ...action.payload };
    },

    addAlert: (
      state,
      action: PayloadAction<Omit<AnalyticsState["alerts"][0], "id">>
    ) => {
      const alert = {
        ...action.payload,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      state.alerts.unshift(alert);

      // Keep only last 50 alerts
      if (state.alerts.length > 50) {
        state.alerts = state.alerts.slice(0, 50);
      }
    },

    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.acknowledged = true;
      }
    },

    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
    },

    clearAlerts: (state) => {
      state.alerts = [];
    },

    clearHistory: (state) => {
      state.spread.history = [];
      state.imbalance.history = [];
      state.alerts = [];
    },

    resetAnalytics: (state) => {
      return initialState;
    },
  },
});

export const {
  updateSpreadData,
  updateImbalanceData,
  updateVolumeProfile,
  updatePressureZoneStats,
  updatePerformanceStats,
  addAlert,
  acknowledgeAlert,
  removeAlert,
  clearAlerts,
  clearHistory,
  resetAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

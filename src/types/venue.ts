export type VenueId = "binance" | "okx" | "bybit" | "deribit";

export interface VenueConfig {
  id: VenueId;
  name: string;
  displayName: string;
  color: string;
  websocketUrl: string;
  restApiUrl: string;
  isEnabled: boolean;
  maxLevels: number;
  updateFrequency: number; // milliseconds
  supports: {
    orderbook: boolean;
    trades: boolean;
    klines: boolean;
  };
}

export interface VenueStatus {
  id: VenueId;
  isConnected: boolean;
  lastUpdate: number;
  connectionAttempts: number;
  errorCount: number;
  latency: number;
  messageCount: number;
}

export interface VenueFilter {
  id: VenueId;
  enabled: boolean;
  color: string;
  opacity: number;
}

export const VENUE_CONFIGS: Record<VenueId, VenueConfig> = {
  binance: {
    id: "binance",
    name: "binance",
    displayName: "Binance",
    color: "#f0b90b",
    websocketUrl: process.env.NEXT_PUBLIC_BINANCE_WS_URL || "",
    restApiUrl: process.env.NEXT_PUBLIC_BINANCE_API_URL || "",
    isEnabled: true,
    maxLevels: 100,
    updateFrequency: 100,
    supports: {
      orderbook: true,
      trades: true,
      klines: true,
    },
  },
  okx: {
    id: "okx",
    name: "okx",
    displayName: "OKX",
    color: "#007fff",
    websocketUrl: process.env.NEXT_PUBLIC_OKX_WS_URL || "",
    restApiUrl: process.env.NEXT_PUBLIC_OKX_API_URL || "",
    isEnabled: true,
    maxLevels: 100,
    updateFrequency: 100,
    supports: {
      orderbook: true,
      trades: true,
      klines: true,
    },
  },
  bybit: {
    id: "bybit",
    name: "bybit",
    displayName: "Bybit",
    color: "#f7931a",
    websocketUrl: process.env.NEXT_PUBLIC_BYBIT_WS_URL || "",
    restApiUrl: process.env.NEXT_PUBLIC_BYBIT_API_URL || "",
    isEnabled: true,
    maxLevels: 100,
    updateFrequency: 100,
    supports: {
      orderbook: true,
      trades: true,
      klines: true,
    },
  },
  deribit: {
    id: "deribit",
    name: "deribit",
    displayName: "Deribit",
    color: "#1e40af",
    websocketUrl: "wss://www.deribit.com/ws/api/v2",
    restApiUrl: "https://www.deribit.com/api/v2",
    isEnabled: false, // Enable later
    maxLevels: 100,
    updateFrequency: 100,
    supports: {
      orderbook: true,
      trades: true,
      klines: false,
    },
  },
};

export interface OrderbookLevel {
  price: number;
  quantity: number;
  timestamp: number;
  venue?: string;
}

export interface OrderbookSide {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export interface OrderbookSnapshot extends OrderbookSide {
  symbol: string;
  timestamp: number;
  venue: string;
  lastUpdateId?: number;
}

export interface OrderbookUpdate {
  symbol: string;
  venue: string;
  timestamp: number;
  eventType: "snapshot" | "update";
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  firstUpdateId?: number;
  finalUpdateId?: number;
}

export interface AggregatedOrderbook {
  symbol: string;
  timestamp: number;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  totalBidVolume: number;
  totalAskVolume: number;
  spread: number;
  midPrice: number;
}

export interface OrderbookMetrics {
  spread: number;
  spreadPercentage: number;
  bidDepth: number;
  askDepth: number;
  imbalance: number; // bid volume / ask volume
  totalVolume: number;
  weightedMidPrice: number;
  lastUpdate: number;
}

export interface PressureZone {
  id: string;
  priceLevel: number;
  intensity: number; // 0-1 scale
  volume: number;
  type: "support" | "resistance";
  venue?: string;
  startTime: number;
  endTime?: number;
  confidence: number; // 0-1 scale
}

export interface OrderbookState {
  snapshot: AggregatedOrderbook | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  metrics: OrderbookMetrics | null;
  pressureZones: PressureZone[];
  selectedVenues: string[];
  updateCount: number;
}

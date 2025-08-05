import { OrderbookSnapshot, OrderbookUpdate } from "@/types/orderbook";
import { ExchangeWebSocketClient } from "./WebSocketManager";

// Deribit WebSocket API endpoint
export const Deribit_WS_BASE_URL = "wss://test.deribit.com/ws/api/v2";

// Deribit API response interfaces
interface DeribitSuccessResponse {
  success: boolean;
  ret_msg: string;
  conn_id: string;
  op: "subscribe" | "unsubscribe";
}

interface DeribitStreamResponse {
  method: "subscription";
  params: {
    channel: string;
    data: {
      type: "snapshot" | "change";
      timestamp: number;
      instrument_name: string;
      bids: [string, string, string][]; // [type, price, amount]
      asks: [string, string, string][]; // [type, price, amount]
      change_id: number;
      prev_change_id: number;
    };
  };
}

export class DeribitWebSocketClient implements ExchangeWebSocketClient {
  private ws: WebSocket | null = null;
  private symbol: string;
  private depth: number;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private lastUpdateId = 0;
  private snapshotFetched = false;

  // Callbacks
  private onSnapshotCallback?: (snapshot: OrderbookSnapshot) => void;
  private onUpdateCallback?: (update: OrderbookUpdate) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;

  constructor(symbol: string = "BTC-PERPETUAL", depth: number = 50) {
    this.symbol = symbol;
    this.depth = depth;
  }

  // Set callback functions
  onSnapshot(callback: (snapshot: OrderbookSnapshot) => void) {
    this.onSnapshotCallback = callback;
  }

  onUpdate(callback: (update: OrderbookUpdate) => void) {
    this.onUpdateCallback = callback;
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.onDisconnectedCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  // Connect to Deribit WebSocket
  async connect(): Promise<void> {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;

    this.ws = new WebSocket(Deribit_WS_BASE_URL);

    this.ws.onopen = () => {
      console.log(`Connected to Deribit WebSocket`);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.subscribe();
      this.onConnectedCallback?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        this.onErrorCallback?.("Error parsing WebSocket message");
      }
    };

    this.ws.onclose = (event) => {
      console.log(
        "Deribit WebSocket connection closed:",
        event.code,
        event.reason
      );
      this.isConnecting = false;
      this.onDisconnectedCallback?.();

      if (
        event.code !== 1000 &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("Deribit WebSocket error:", error);
      this.isConnecting = false;
      this.onErrorCallback?.("WebSocket connection error");
    };
  }

  private subscribe() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = {
        jsonrpc: "2.0",
        method: "public/subscribe",
        id: 42,
        params: {
          channels: [`book.${this.symbol}.100ms`],
        },
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  private handleMessage(
    data: DeribitSuccessResponse | DeribitStreamResponse
  ): void {
    if ("success" in data) {
      if (!data.success) {
        console.error(`Deribit WebSocket error: ${data.ret_msg}`);
        this.onErrorCallback?.(`Deribit WebSocket error: ${data.ret_msg}`);
      }
      return;
    }

    if (data.method === "subscription") {
      const { channel, data: streamData } = data.params;
      if (channel.startsWith("book.")) {
        if (streamData.type === "snapshot") {
          this.handleSnapshot(streamData);
        } else if (streamData.type === "change") {
          this.handleUpdate(streamData);
        }
      }
    }
  }

  private handleSnapshot(
    data: DeribitStreamResponse["params"]["data"]
  ): void {
    const { timestamp, instrument_name, bids, asks, change_id } = data;

    const snapshot: OrderbookSnapshot = {
      symbol: instrument_name,
      venue: "Deribit",
      timestamp: timestamp,
      lastUpdateId: change_id,
      bids: bids.map(([, price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: "Deribit",
      })),
      asks: asks.map(([, price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: "Deribit",
      })),
    };

    this.snapshotFetched = true;
    this.lastUpdateId = change_id;
    this.onSnapshotCallback?.(snapshot);
  }

  private handleUpdate(data: DeribitStreamResponse["params"]["data"]): void {
    if (!this.snapshotFetched) return;

    const {
      timestamp,
      instrument_name,
      bids,
      asks,
      change_id,
      prev_change_id,
    } = data;

    if (prev_change_id !== this.lastUpdateId) {
      console.warn(
        `Missed an update. Expected ${this.lastUpdateId}, got ${prev_change_id}`
      );
      // Consider fetching a new snapshot
    }

    const update: OrderbookUpdate = {
      symbol: instrument_name,
      venue: "Deribit",
      timestamp: timestamp,
      eventType: "update",
      firstUpdateId: prev_change_id,
      finalUpdateId: change_id,
      bids: bids.map(([, price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: "Deribit",
      })),
      asks: asks.map(([, price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: "Deribit",
      })),
    };

    this.lastUpdateId = change_id;
    this.onUpdateCallback?.(update);
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect();
      }
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
    this.snapshotFetched = false;
    this.lastUpdateId = 0;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

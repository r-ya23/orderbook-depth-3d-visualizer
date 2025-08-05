import { OrderbookSnapshot, OrderbookUpdate } from '@/types/orderbook';
import { ExchangeWebSocketClient } from './WebSocketManager';

// Bybit WebSocket API endpoint
export const BYBIT_WS_BASE_URL = "wss://stream.bybit.com/v5/public/spot";

// Bybit API response interfaces
interface BybitSuccessResponse {
  success: boolean;
  ret_msg: string;
  conn_id: string;
  op: 'subscribe' | 'unsubscribe';
}

interface BybitOrderbookData {
  s: string; // Symbol
  b: [string, string][]; // Bids [price, size]
  a: [string, string][]; // Asks [price, size]
  u: number; // Update ID
  seq: number; // Sequence
}

interface BybitStreamResponse {
  topic: string;
  type: 'snapshot' | 'delta';
  ts: number;
  data: BybitOrderbookData;
}

export class BybitWebSocketClient implements ExchangeWebSocketClient {
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

  constructor(symbol: string = 'BTC-USDT', depth: number = 50) {
    this.symbol = symbol.replace('-', '').toUpperCase();
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

  // Connect to Bybit WebSocket
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    this.ws = new WebSocket(BYBIT_WS_BASE_URL);

    this.ws.onopen = () => {
      console.log(`Connected to Bybit WebSocket`);
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
        console.error('Error parsing WebSocket message:', error);
        this.onErrorCallback?.('Error parsing WebSocket message');
      }
    };

    this.ws.onclose = (event) => {
      console.log('Bybit WebSocket connection closed:', event.code, event.reason);
      this.isConnecting = false;
      this.onDisconnectedCallback?.();

      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('Bybit WebSocket error:', error);
      this.isConnecting = false;
      this.onErrorCallback?.('WebSocket connection error');
    };
  }

  private subscribe() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscription = {
        op: 'subscribe',
        args: [`orderbook.${this.depth}.${this.symbol}`],
      };
      this.ws.send(JSON.stringify(subscription));
    }
  }

  private handleMessage(data: BybitSuccessResponse | BybitStreamResponse): void {
    if ('success' in data) {
      if (!data.success) {
        console.error(`Bybit WebSocket error: ${data.ret_msg}`);
        this.onErrorCallback?.(`Bybit WebSocket error: ${data.ret_msg}`);
      }
      return;
    }

    if ('topic' in data) {
      if (data.type === 'snapshot') {
        this.handleSnapshot(data);
      } else if (data.type === 'delta') {
        this.handleUpdate(data);
      }
    }
  }

  private handleSnapshot(data: BybitStreamResponse): void {
    const snapshotData = data.data;
    const timestamp = data.ts;

    const snapshot: OrderbookSnapshot = {
      symbol: snapshotData.s,
      venue: 'bybit',
      timestamp: timestamp,
      lastUpdateId: snapshotData.u,
      bids: snapshotData.b.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'bybit',
      })),
      asks: snapshotData.a.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'bybit',
      })),
    };

    this.snapshotFetched = true;
    this.onSnapshotCallback?.(snapshot);
  }

  private handleUpdate(data: BybitStreamResponse): void {
    if (!this.snapshotFetched) return;

    const updateData = data.data;
    const timestamp = data.ts;

    const update: OrderbookUpdate = {
      symbol: updateData.s,
      venue: 'bybit',
      timestamp: timestamp,
      eventType: 'update',
      firstUpdateId: this.lastUpdateId + 1,
      finalUpdateId: updateData.u,
      bids: updateData.b.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'bybit',
      })),
      asks: updateData.a.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'bybit',
      })),
    };

    this.lastUpdateId = updateData.u;
    this.onUpdateCallback?.(update);
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect();
      }
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
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

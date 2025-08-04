import { OrderbookSnapshot, OrderbookUpdate } from '@/types/orderbook';
import { ExchangeWebSocketClient } from './WebSocketManager';

// OKX WebSocket API endpoint
export const OKX_WS_BASE_URL = 'wss://ws.okx.com:8443/ws/v5/public';

// OKX API response interfaces
interface OkxSuccessResponse {
  event: 'subscribe' | 'unsubscribe';
  arg: {
    channel: string;
    instId: string;
  };
  connId: string;
}

interface OkxErrorResponse {
  event: 'error';
  msg: string;
  code: string;
}

interface OkxDataObject {
  asks: [string, string, string, string][]; // [price, quantity, liquidated orders, num orders]
  bids: [string, string, string, string][]; // [price, quantity, liquidated orders, num orders]
  ts: string; // Timestamp
  checksum: number;
}

interface OkxStreamResponse {
  arg: {
    channel: string;
    instId: string;
  };
  action: 'snapshot' | 'update';
  data: OkxDataObject[];
}

export class OkxWebSocketClient implements ExchangeWebSocketClient {
  private ws: WebSocket | null = null;
  private symbol: string;
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

  constructor(symbol: string = 'BTC-USDT') {
    this.symbol = symbol.toUpperCase();
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

  // Connect to OKX WebSocket
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    this.ws = new WebSocket(OKX_WS_BASE_URL);

    this.ws.onopen = () => {
      console.log(`Connected to OKX WebSocket`);
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
      console.log('OKX WebSocket connection closed:', event.code, event.reason);
      this.isConnecting = false;
      this.onDisconnectedCallback?.();

      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('OKX WebSocket error:', error);
      this.isConnecting = false;
      this.onErrorCallback?.('WebSocket connection error');
    };
  }

  private subscribe() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscription = {
        op: 'subscribe',
        args: [
          {
            channel: 'books',
            instId: this.symbol,
          },
        ],
      };
      this.ws.send(JSON.stringify(subscription));
    }
  }

  private handleMessage(data: OkxSuccessResponse | OkxErrorResponse | OkxStreamResponse): void {
    if ('event' in data) {
      if (data.event === 'error') {
        console.error(`OKX WebSocket error: ${data.msg} (code: ${data.code})`);
        this.onErrorCallback?.(`OKX WebSocket error: ${data.msg}`);
      }
      return;
    }

    if ('action' in data) {
      if (data.action === 'snapshot') {
        this.handleSnapshot(data);
      } else if (data.action === 'update') {
        this.handleUpdate(data);
      }
    }
  }

  private handleSnapshot(data: OkxStreamResponse): void {
    const snapshotData = data.data[0];
    const timestamp = parseInt(snapshotData.ts, 10);

    const snapshot: OrderbookSnapshot = {
      symbol: this.symbol,
      venue: 'okx',
      timestamp: timestamp,
      lastUpdateId: snapshotData.checksum,
      bids: snapshotData.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'okx',
      })),
      asks: snapshotData.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'okx',
      })),
    };

    this.snapshotFetched = true;
    this.onSnapshotCallback?.(snapshot);
  }

  private handleUpdate(data: OkxStreamResponse): void {
    if (!this.snapshotFetched) return;

    const updateData = data.data[0];
    const timestamp = parseInt(updateData.ts, 10);

    const update: OrderbookUpdate = {
      symbol: this.symbol,
      venue: 'okx',
      timestamp: timestamp,
      eventType: 'update',
      firstUpdateId: this.lastUpdateId + 1, // OKX does not provide update IDs in the same way as Binance
      finalUpdateId: updateData.checksum,
      bids: updateData.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'okx',
      })),
      asks: updateData.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: timestamp,
        venue: 'okx',
      })),
    };

    this.lastUpdateId = updateData.checksum;
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

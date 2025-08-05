import { OrderbookSnapshot, OrderbookUpdate } from '@/types/orderbook';
import { ExchangeWebSocketClient } from './WebSocketManager';

// Binance WebSocket API endpoints
export const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/ws';

// Binance API response interfaces
interface BinanceDepthSnapshot {
  lastUpdateId: number;
  bids: [string, string][]; // [price, quantity]
  asks: [string, string][]; // [price, quantity]
}

export class BinanceWebSocketClient implements ExchangeWebSocketClient {
  private ws: WebSocket | null = null;
  private symbol: string;
  private depth: number;
  private updateSpeed: string; // This is no longer used for the stream URL but kept for constructor compatibility
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // Callbacks
  private onSnapshotCallback?: (snapshot: OrderbookSnapshot) => void;
  private onUpdateCallback?: (update: OrderbookUpdate) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;

  constructor(
    symbol: string = 'BTCUSDT',
    depth: number = 20,
    updateSpeed: string = '100ms'
  ) {
    this.symbol = symbol.toUpperCase();
    // For partial book depth stream, depth must be 5, 10, or 20.
    if (![5, 10, 20].includes(depth)) {
      console.warn(`Binance partial book depth stream only supports levels 5, 10, or 20. Defaulting to 20.`);
      this.depth = 20;
    } else {
      this.depth = depth;
    }
    this.updateSpeed = updateSpeed;
  }

  // Set callback functions
  onSnapshot(callback: (snapshot: OrderbookSnapshot) => void) {
    this.onSnapshotCallback = callback;
  }

  onUpdate(callback: (update: OrderbookUpdate) => void) {
    // This client now uses snapshots, so onUpdate will not be called.
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

  // Connect to Binance WebSocket
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // Use Partial Book Depth Stream which sends snapshots
      const streamName = `${this.symbol.toLowerCase()}@depth${this.depth}`;
      const wsUrl = `${BINANCE_WS_BASE_URL}/${streamName}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`Connected to Binance WebSocket: ${streamName}`);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onConnectedCallback?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: BinanceDepthSnapshot = JSON.parse(event.data);
          this.handleSnapshotMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.onErrorCallback?.('Error parsing WebSocket message');
        }
      };

      this.ws.onclose = (event) => {
        console.log('Binance WebSocket connection closed:', event.code, event.reason);
        this.isConnecting = false;
        this.onDisconnectedCallback?.();

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        this.isConnecting = false;
        this.onErrorCallback?.('WebSocket connection error');
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to Binance WebSocket:', error);
      this.onErrorCallback?.('Failed to connect to WebSocket');
    }
  }

  private handleSnapshotMessage(data: BinanceDepthSnapshot): void {
    const snapshot: OrderbookSnapshot = {
      symbol: this.symbol,
      venue: 'binance',
      timestamp: Date.now(),
      lastUpdateId: data.lastUpdateId,
      bids: data.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: Date.now(),
        venue: 'binance'
      })),
      asks: data.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: Date.now(),
        venue: 'binance'
      }))
    };

    this.onSnapshotCallback?.(snapshot);
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * 2 ** (this.reconnectAttempts - 1),
      30000 // Max delay of 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect();
      }
    }, delay);
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.onDisconnectedCallback?.();
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

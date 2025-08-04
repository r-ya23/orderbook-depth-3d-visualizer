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

interface BinanceDepthUpdate {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID in event
  u: number; // Final update ID in event
  b: [string, string][]; // Bids to be updated [price, quantity]
  a: [string, string][]; // Asks to be updated [price, quantity]
}

export class BinanceWebSocketClient implements ExchangeWebSocketClient {
  private ws: WebSocket | null = null;
  private symbol: string;
  private depth: number;
  private updateSpeed: string;
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

  constructor(
    symbol: string = 'BTCUSDT',
    depth: number = 20,
    updateSpeed: string = '100ms'
  ) {
    this.symbol = symbol.toUpperCase();
    this.depth = depth;
    this.updateSpeed = updateSpeed;
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

  // Connect to Binance WebSocket
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // First, fetch the initial snapshot
      await this.fetchSnapshot();

      // Then connect to the WebSocket stream
      const streamName = `${this.symbol.toLowerCase()}@depth${this.depth}@${this.updateSpeed}`;
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
          const data: BinanceDepthUpdate = JSON.parse(event.data);
          this.handleDepthUpdate(data);
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

  // Fetch initial orderbook snapshot from REST API
  private async fetchSnapshot(): Promise<void> {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${this.symbol}&limit=${this.depth * 2}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BinanceDepthSnapshot = await response.json();
      
      // Store the last update ID for synchronization
      this.lastUpdateId = data.lastUpdateId;
      this.snapshotFetched = true;

      // Convert to our format
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
    } catch (error) {
      console.error('Failed to fetch orderbook snapshot:', error);
      this.onErrorCallback?.('Failed to fetch initial orderbook snapshot');
      throw error;
    }
  }

  // Handle depth update messages
  private handleDepthUpdate(data: BinanceDepthUpdate): void {
    // Skip updates that are older than our snapshot
    if (!this.snapshotFetched || data.u <= this.lastUpdateId) {
      return;
    }

    // Convert to our format
    const update: OrderbookUpdate = {
      symbol: this.symbol,
      venue: 'binance',
      timestamp: data.E,
      eventType: 'update',
      firstUpdateId: data.U,
      finalUpdateId: data.u,
      bids: (data.b || []).map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: data.E,
        venue: 'binance'
      })),
      asks: (data.a || []).map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        timestamp: data.E,
        venue: 'binance'
      }))
    };

    // Update the last update ID
    this.lastUpdateId = data.u;

    this.onUpdateCallback?.(update);
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

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
    this.snapshotFetched = false;
    this.lastUpdateId = 0;
    this.reconnectAttempts = 0;
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

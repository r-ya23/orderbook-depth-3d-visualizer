import { OrderbookSnapshot, OrderbookUpdate } from '@/types/orderbook';

export interface ExchangeWebSocketClient {
  connect(): Promise<void>;
  disconnect(): void;
  onSnapshot(callback: (snapshot: OrderbookSnapshot) => void): void;
  onUpdate(callback: (update: OrderbookUpdate) => void): void;
  onConnected(callback: () => void): void;
  onDisconnected(callback: () => void): void;
  onError(callback: (error: string) => void): void;
  isConnected(): boolean;
}

export class WebSocketManager {
  private clients: Map<string, ExchangeWebSocketClient> = new Map();

  constructor() {}

  addClient(venue: string, client: ExchangeWebSocketClient) {
    this.clients.set(venue, client);
  }

  getClient(venue: string): ExchangeWebSocketClient | undefined {
    return this.clients.get(venue);
  }

  connectAll() {
    this.clients.forEach(client => client.connect());
  }

  disconnectAll() {
    this.clients.forEach(client => client.disconnect());
  }
}

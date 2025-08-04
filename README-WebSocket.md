# Binance WebSocket Orderbook Implementation

This document provides comprehensive documentation for the Binance WebSocket orderbook depth data implementation.

## Overview

The implementation consists of several key components:

1. **BinanceWebSocketClient** - Core WebSocket client class
2. **useWebSocket** - React hook for easy integration
3. **Redux Integration** - State management for orderbook data
4. **Type Definitions** - TypeScript interfaces for type safety

## Features

- ✅ Real-time orderbook depth data from Binance
- ✅ Automatic reconnection with exponential backoff
- ✅ Initial snapshot fetching via REST API
- ✅ Proper synchronization between snapshot and updates
- ✅ Redux state management integration
- ✅ React hook for easy component integration
- ✅ TypeScript support with full type safety
- ✅ Configurable depth levels (5, 10, 20, 50, 100)
- ✅ Configurable update speeds (100ms, 1000ms)
- ✅ Multiple symbol support
- ✅ Error handling and connection status tracking
- ✅ Orderbook metrics calculation
- ✅ Memory-efficient update processing

## Quick Start

### Basic Usage

```typescript
import { createBinanceWebSocketClient } from '@/lib/api/websocket';

// Create client
const client = createBinanceWebSocketClient('BTCUSDT', 20, '100ms');

// Set up event handlers
client.onSnapshot((snapshot) => {
  console.log('Snapshot received:', snapshot);
});

client.onUpdate((update) => {
  console.log('Update received:', update);
});

// Connect
await client.connect();
```

### React Hook Usage

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const { connect, disconnect, isConnected } = useWebSocket({
    symbol: 'BTCUSDT',
    depth: 20,
    updateSpeed: '100ms',
    autoConnect: true
  });

  const { snapshot, metrics } = useSelector(state => state.orderbook);

  return (
    <div>
      <button onClick={connect} disabled={isConnected}>Connect</button>
      <button onClick={disconnect} disabled={!isConnected}>Disconnect</button>
      {snapshot && <div>Current spread: ${snapshot.spread}</div>}
    </div>
  );
};
```

## API Reference

### BinanceWebSocketClient

#### Constructor

```typescript
new BinanceWebSocketClient(symbol?: string, depth?: number, updateSpeed?: string)
```

**Parameters:**
- `symbol` (optional): Trading pair symbol (default: 'BTCUSDT')
- `depth` (optional): Orderbook depth level (default: 20)
- `updateSpeed` (optional): Update frequency '100ms' or '1000ms' (default: '100ms')

#### Methods

##### connect(): Promise<void>
Connects to the Binance WebSocket stream. First fetches initial snapshot, then establishes WebSocket connection.

##### disconnect(): void
Disconnects from the WebSocket and cleans up resources.

##### changeSymbol(newSymbol: string): void
Changes the trading symbol. Reconnects if currently connected.

##### changeDepth(newDepth: number): void
Changes the orderbook depth level. Reconnects if currently connected.

##### changeUpdateSpeed(newSpeed: string): void
Changes the update frequency. Reconnects if currently connected.

##### isConnected(): boolean
Returns current connection status.

#### Event Handlers

##### onSnapshot(callback: (snapshot: OrderbookSnapshot) => void)
Called when initial orderbook snapshot is received.

##### onUpdate(callback: (update: OrderbookUpdate) => void)
Called when orderbook updates are received.

##### onConnected(callback: () => void)
Called when WebSocket connection is established.

##### onDisconnected(callback: () => void)
Called when WebSocket connection is closed.

##### onError(callback: (error: string) => void)
Called when an error occurs.

### useWebSocket Hook

#### Parameters

```typescript
interface UseWebSocketOptions {
  symbol?: string;           // Trading pair (default: 'BTCUSDT')
  depth?: number;           // Depth level (default: 20)
  updateSpeed?: '100ms' | '1000ms'; // Update speed (default: '100ms')
  autoConnect?: boolean;    // Auto-connect on mount (default: true)
}
```

#### Return Value

```typescript
interface UseWebSocketReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  changeSymbol: (symbol: string) => void;
  changeDepth: (depth: number) => void;
  changeUpdateSpeed: (speed: string) => void;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  client: BinanceWebSocketClient | null;
}
```

## Data Types

### OrderbookSnapshot

```typescript
interface OrderbookSnapshot {
  symbol: string;
  venue: string;
  timestamp: number;
  lastUpdateId?: number;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}
```

### OrderbookUpdate

```typescript
interface OrderbookUpdate {
  symbol: string;
  venue: string;
  timestamp: number;
  eventType: "snapshot" | "update";
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  firstUpdateId?: number;
  finalUpdateId?: number;
}
```

### OrderbookLevel

```typescript
interface OrderbookLevel {
  price: number;
  quantity: number;
  timestamp: number;
  venue?: string;
}
```

### OrderbookMetrics

```typescript
interface OrderbookMetrics {
  spread: number;
  spreadPercentage: number;
  bidDepth: number;
  askDepth: number;
  imbalance: number;
  totalVolume: number;
  weightedMidPrice: number;
  lastUpdate: number;
}
```

## Configuration

### Supported Symbols
Any valid Binance spot trading pair (e.g., 'BTCUSDT', 'ETHUSDT', 'ADAUSDT')

### Depth Levels
- 5, 10, 20, 50, 100 levels

### Update Speeds
- `'100ms'` - Fast updates (10 updates per second)
- `'1000ms'` - Slow updates (1 update per second)

## Error Handling

The implementation includes comprehensive error handling:

1. **Connection Errors**: Automatic reconnection with exponential backoff
2. **Data Parsing Errors**: Graceful error handling with logging
3. **Network Issues**: Automatic retry mechanism
4. **Rate Limiting**: Built-in protection against excessive requests

### Reconnection Strategy

- Maximum 5 reconnection attempts
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Automatic reset on successful connection

## Performance Considerations

### Memory Management
- Efficient update processing using Maps
- Automatic cleanup on disconnect
- Limited history storage to prevent memory leaks

### Network Optimization
- Single WebSocket connection per symbol
- Minimal data transfer with delta updates
- Proper connection pooling

### CPU Optimization
- Efficient data structures for orderbook management
- Minimal re-renders in React components
- Optimized Redux state updates

## Best Practices

### 1. Connection Management
```typescript
// Always clean up connections
useEffect(() => {
  return () => {
    client.disconnect();
  };
}, []);
```

### 2. Error Handling
```typescript
client.onError((error) => {
  console.error('WebSocket error:', error);
  // Implement custom error handling logic
});
```

### 3. Performance
```typescript
// Use React.memo for components that consume orderbook data
const OrderbookDisplay = React.memo(({ snapshot }) => {
  // Component implementation
});
```

### 4. State Management
```typescript
// Use selectors to avoid unnecessary re-renders
const snapshot = useSelector(state => state.orderbook.snapshot);
const isConnected = useSelector(state => state.orderbook.isConnected);
```

## Examples

See `src/examples/websocket-usage.ts` for comprehensive usage examples including:

1. Basic WebSocket client usage
2. Multiple symbol monitoring
3. Advanced configuration
4. React hook integration
5. Error handling patterns
6. Data analysis and processing

## Demo

Run the demo application

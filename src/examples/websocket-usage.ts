/**
 * Example usage of Binance WebSocket client for orderbook depth data
 * 
 * This file demonstrates different ways to use the WebSocket implementation:
 * 1. Basic usage with the BinanceWebSocketClient class
 * 2. React hook usage with useWebSocket
 * 3. Integration with Redux store
 */

import { BinanceWebSocketClient, createBinanceWebSocketClient } from '@/lib/api/websocket';
import { OrderbookSnapshot, OrderbookUpdate } from '@/types/orderbook';

// Example 1: Basic WebSocket Client Usage
export const basicWebSocketExample = () => {
  // Create a new WebSocket client
  const client = createBinanceWebSocketClient('BTCUSDT', 20, '100ms');

  // Set up event handlers
  client.onSnapshot((snapshot: OrderbookSnapshot) => {
    console.log('Received orderbook snapshot:', {
      symbol: snapshot.symbol,
      venue: snapshot.venue,
      bidsCount: snapshot.bids.length,
      asksCount: snapshot.asks.length,
      timestamp: new Date(snapshot.timestamp).toISOString()
    });

    // Process the snapshot data
    const bestBid = snapshot.bids[0];
    const bestAsk = snapshot.asks[0];
    const spread = bestAsk.price - bestBid.price;
    
    console.log(`Best bid: $${bestBid.price}, Best ask: $${bestAsk.price}, Spread: $${spread}`);
  });

  client.onUpdate((update: OrderbookUpdate) => {
    console.log('Received orderbook update:', {
      symbol: update.symbol,
      venue: update.venue,
      bidUpdates: update.bids.length,
      askUpdates: update.asks.length,
      updateId: update.finalUpdateId
    });
  });

  client.onConnected(() => {
    console.log('WebSocket connected successfully');
  });

  client.onDisconnected(() => {
    console.log('WebSocket disconnected');
  });

  client.onError((error: string) => {
    console.error('WebSocket error:', error);
  });

  // Connect to the WebSocket
  client.connect().catch(console.error);

  // Return client for further control
  return client;
};

// Example 2: Multiple Symbol Monitoring
export const multiSymbolExample = () => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
  const clients: BinanceWebSocketClient[] = [];

  symbols.forEach(symbol => {
    const client = createBinanceWebSocketClient(symbol, 10, '1000ms');
    
    client.onSnapshot((snapshot) => {
      console.log(`${symbol} snapshot:`, {
        bestBid: snapshot.bids[0]?.price,
        bestAsk: snapshot.asks[0]?.price,
        spread: snapshot.asks[0]?.price - snapshot.bids[0]?.price
      });
    });

    client.onUpdate((update) => {
      console.log(`${symbol} update: ${update.bids.length + update.asks.length} changes`);
    });

    client.connect().catch(console.error);
    clients.push(client);
  });

  // Cleanup function
  return () => {
    clients.forEach(client => client.disconnect());
  };
};

// Example 3: Advanced Configuration
export const advancedConfigExample = () => {
  const client = new BinanceWebSocketClient('SOLUSDT', 50, '100ms');

  // Track orderbook metrics
  let totalUpdates = 0;
  let lastSpread = 0;
  const spreadHistory: number[] = [];

  client.onSnapshot((snapshot) => {
    const bestBid = snapshot.bids[0]?.price || 0;
    const bestAsk = snapshot.asks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    
    lastSpread = spread;
    spreadHistory.push(spread);
    
    // Keep only last 100 spreads
    if (spreadHistory.length > 100) {
      spreadHistory.shift();
    }

    console.log('Snapshot received:', {
      symbol: snapshot.symbol,
      spread: spread.toFixed(4),
      avgSpread: (spreadHistory.reduce((a, b) => a + b, 0) / spreadHistory.length).toFixed(4),
      totalVolume: snapshot.bids.reduce((sum, bid) => sum + bid.quantity, 0) +
                   snapshot.asks.reduce((sum, ask) => sum + ask.quantity, 0)
    });
  });

  client.onUpdate((update) => {
    totalUpdates++;
    
    if (totalUpdates % 10 === 0) {
      console.log(`Processed ${totalUpdates} updates, current spread: ${lastSpread.toFixed(4)}`);
    }
  });

  client.onError((error) => {
    console.error('Connection error, attempting to reconnect...', error);
    // The client will automatically attempt to reconnect
  });

  return client;
};

// Example 4: React Hook Usage (TypeScript)
export const reactHookExample = `
import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const OrderbookComponent: React.FC = () => {
  const { 
    connect, 
    disconnect, 
    changeSymbol, 
    isConnected, 
    isLoading, 
    error 
  } = useWebSocket({
    symbol: 'BTCUSDT',
    depth: 20,
    updateSpeed: '100ms',
    autoConnect: true
  });

  const { snapshot, metrics } = useSelector((state: RootState) => state.orderbook);

  return (
    <div>
      <div>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {isLoading && ' (Loading...)'}
        {error && \` (Error: \${error})\`}
      </div>
      
      <button onClick={connect} disabled={isConnected}>
        Connect
      </button>
      
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect
      </button>
      
      <button onClick={() => changeSymbol('ETHUSDT')}>
        Switch to ETH/USDT
      </button>

      {snapshot && (
        <div>
          <h3>{snapshot.symbol} Orderbook</h3>
          <p>Best Bid: \${Array.from(snapshot.bids.keys())[0]}</p>
          <p>Best Ask: \${Array.from(snapshot.asks.keys())[0]}</p>
          <p>Spread: \${snapshot.spread.toFixed(2)}</p>
        </div>
      )}

      {metrics && (
        <div>
          <h3>Metrics</h3>
          <p>Total Volume: {metrics.totalVolume.toFixed(4)}</p>
          <p>Imbalance: {metrics.imbalance.toFixed(2)}</p>
          <p>Spread %: {metrics.spreadPercentage.toFixed(4)}%</p>
        </div>
      )}
    </div>
  );
};
`;

// Example 5: Error Handling and Reconnection
export const errorHandlingExample = () => {
  const client = createBinanceWebSocketClient('BTCUSDT', 20, '100ms');
  
  let reconnectCount = 0;
  const maxReconnects = 3;

  client.onError((error) => {
    console.error('WebSocket error:', error);
    
    if (reconnectCount < maxReconnects) {
      reconnectCount++;
      console.log(`Attempting reconnection ${reconnectCount}/${maxReconnects}...`);
      
      setTimeout(() => {
        client.connect().catch(console.error);
      }, 5000 * reconnectCount); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  });

  client.onConnected(() => {
    reconnectCount = 0; // Reset counter on successful connection
    console.log('Successfully connected/reconnected');
  });

  return client;
};

// Example 6: Data Processing and Analysis
export const dataAnalysisExample = () => {
  const client = createBinanceWebSocketClient('BTCUSDT', 100, '100ms');
  
  // Data storage for analysis
  const priceHistory: number[] = [];
  const volumeHistory: number[] = [];
  let lastSnapshot: OrderbookSnapshot | null = null;

  client.onSnapshot((snapshot) => {
    lastSnapshot = snapshot;
    
    // Calculate mid price from best bid and ask
    const bestBid = snapshot.bids[0]?.price || 0;
    const bestAsk = snapshot.asks[0]?.price || 0;
    const midPrice = (bestBid + bestAsk) / 2;
    
    // Calculate total volume
    const totalBidVolume = snapshot.bids.reduce((sum, bid) => sum + bid.quantity, 0);
    const totalAskVolume = snapshot.asks.reduce((sum, ask) => sum + ask.quantity, 0);
    const totalVolume = totalBidVolume + totalAskVolume;
    
    priceHistory.push(midPrice);
    volumeHistory.push(totalVolume);
    
    // Keep only last 1000 data points
    if (priceHistory.length > 1000) {
      priceHistory.shift();
      volumeHistory.shift();
    }
    
    // Calculate moving averages
    const priceMA = priceHistory.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, priceHistory.length);
    const volumeMA = volumeHistory.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumeHistory.length);
    
    console.log('Analysis:', {
      currentPrice: midPrice.toFixed(2),
      priceMA20: priceMA.toFixed(2),
      currentVolume: totalVolume.toFixed(4),
      volumeMA20: volumeMA.toFixed(4),
      priceChange: priceHistory.length > 1 ? 
        ((midPrice - priceHistory[priceHistory.length - 2]) / priceHistory[priceHistory.length - 2] * 100).toFixed(4) + '%' : 
        'N/A'
    });
  });

  client.onUpdate((update) => {
    if (!lastSnapshot) return;
    
    // Analyze update patterns
    const bidUpdates = update.bids.filter(bid => bid.quantity > 0).length;
    const askUpdates = update.asks.filter(ask => ask.quantity > 0).length;
    const bidRemovals = update.bids.filter(bid => bid.quantity === 0).length;
    const askRemovals = update.asks.filter(ask => ask.quantity === 0).length;
    
    if (bidUpdates + askUpdates + bidRemovals + askRemovals > 10) {
      console.log('High activity detected:', {
        bidUpdates,
        askUpdates,
        bidRemovals,
        askRemovals,
        timestamp: new Date(update.timestamp).toISOString()
      });
    }
  });

  return client;
};

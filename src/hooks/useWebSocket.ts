import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  setLoading,
  setConnected,
  setError,
  updateSnapshot,
  updateMetrics,
  clearOrderbook,
} from '@/store/orderbookslice';
import webSocketManager from '@/lib/api/websocket';
import { ExchangeWebSocketClient } from '@/lib/api/WebSocketManager';
import {
  OrderbookSnapshot,
  OrderbookUpdate,
  AggregatedOrderbook,
  OrderbookMetrics,
  OrderbookLevel,
} from '@/types/orderbook';
import { VenueId } from '@/types/venue';

interface UseWebSocketOptions {
  venue?: string;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  client: ExchangeWebSocketClient | null;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    venue = 'binance',
    autoConnect = true,
  } = options;

  const dispatch = useDispatch();
  const { isConnected, isLoading, error } = useSelector((state: RootState) => state.orderbook);
  const { venues } = useSelector((state: RootState) => state.filters);
  
  const clientRef = useRef<ExchangeWebSocketClient | null>(null);
  const currentOrderbookRef = useRef<Map<number, OrderbookLevel>>(new Map());
  const currentAsksRef = useRef<Map<number, OrderbookLevel>>(new Map());

  // Initialize WebSocket client
  useEffect(() => {
    const client = webSocketManager.getClient(venue);
    if (client) {
      clientRef.current = client;
      setupClientCallbacks();
      if (autoConnect && !client.isConnected() && venues[venue as VenueId].enabled) {
        connect();
      }
    }
  }, [venue, autoConnect, venues]);

  // Setup client callbacks
  const setupClientCallbacks = useCallback(() => {
    if (!clientRef.current) return;

    const client = clientRef.current;

    client.onConnected(() => {
      dispatch(setConnected(true));
      dispatch(setLoading(false));
      console.log(`WebSocket connected successfully to ${venue}`);
    });

    client.onDisconnected(() => {
      dispatch(setConnected(false));
      dispatch(setLoading(false));
      console.log(`WebSocket disconnected from ${venue}`);
    });

    client.onError((errorMessage: string) => {
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      console.error(`WebSocket error from ${venue}:`, errorMessage);
    });

    client.onSnapshot((snapshot: OrderbookSnapshot) => {
      console.log('Received orderbook snapshot:', snapshot.symbol);
      
      // Clear existing orderbook data
      currentOrderbookRef.current.clear();
      currentAsksRef.current.clear();

      // Store snapshot data
      snapshot.bids.forEach(level => {
        currentOrderbookRef.current.set(level.price, level);
      });
      
      snapshot.asks.forEach(level => {
        currentAsksRef.current.set(level.price, level);
      });

      // Convert to aggregated format and dispatch
      const aggregatedOrderbook = convertToAggregatedOrderbook(snapshot);
      dispatch(updateSnapshot(aggregatedOrderbook));
      
      // Calculate and update metrics
      const metrics = calculateOrderbookMetrics(aggregatedOrderbook);
      dispatch(updateMetrics(metrics));
    });

    client.onUpdate((update: OrderbookUpdate) => {
      console.log('Received orderbook update:', update.symbol, 'Updates:', update.bids.length + update.asks.length);
      
      // Apply bid updates
      update.bids.forEach(level => {
        if (level.quantity === 0) {
          // Remove level if quantity is 0
          currentOrderbookRef.current.delete(level.price);
        } else {
          // Update or add level
          currentOrderbookRef.current.set(level.price, level);
        }
      });

      // Apply ask updates
      update.asks.forEach(level => {
        if (level.quantity === 0) {
          // Remove level if quantity is 0
          currentAsksRef.current.delete(level.price);
        } else {
          // Update or add level
          currentAsksRef.current.set(level.price, level);
        }
      });

      // Convert updated data to snapshot format
      const updatedSnapshot: OrderbookSnapshot = {
        symbol: update.symbol,
        venue: update.venue,
        timestamp: update.timestamp,
        lastUpdateId: update.finalUpdateId,
        bids: Array.from(currentOrderbookRef.current.values())
          .sort((a, b) => b.price - a.price), // Sort bids descending
        asks: Array.from(currentAsksRef.current.values())
          .sort((a, b) => a.price - b.price), // Sort asks ascending
      };

      // Convert to aggregated format and dispatch
      const aggregatedOrderbook = convertToAggregatedOrderbook(updatedSnapshot);
      dispatch(updateSnapshot(aggregatedOrderbook));
      
      // Calculate and update metrics
      const metrics = calculateOrderbookMetrics(aggregatedOrderbook);
      dispatch(updateMetrics(metrics));
    });
  }, [dispatch, venue]);

  // Convert snapshot to aggregated orderbook format
  const convertToAggregatedOrderbook = (snapshot: OrderbookSnapshot): AggregatedOrderbook => {
    // Calculate totals
    const totalBidVolume = snapshot.bids.reduce((sum, level) => sum + level.quantity, 0);
    const totalAskVolume = snapshot.asks.reduce((sum, level) => sum + level.quantity, 0);

    // Calculate spread and mid price
    const bestBid = snapshot.bids.length > 0 ? snapshot.bids[0].price : 0;
    const bestAsk = snapshot.asks.length > 0 ? snapshot.asks[0].price : 0;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;

    return {
      symbol: snapshot.symbol,
      timestamp: snapshot.timestamp,
      bids: snapshot.bids,
      asks: snapshot.asks,
      totalBidVolume,
      totalAskVolume,
      spread,
      midPrice,
    };
  };

  // Calculate orderbook metrics
  const calculateOrderbookMetrics = (orderbook: AggregatedOrderbook): OrderbookMetrics => {
    const bestBidPrice = orderbook.bids.length > 0 ? orderbook.bids[0].price : 0;
    const bestAskPrice = orderbook.asks.length > 0 ? orderbook.asks[0].price : 0;
    
    const spread = bestAskPrice - bestBidPrice;
    const spreadPercentage = (spread / orderbook.midPrice) * 100;
    
    // Calculate depth (total volume within 1% of best prices)
    const bidDepthThreshold = bestBidPrice * 0.99;
    const askDepthThreshold = bestAskPrice * 1.01;
    
    let bidDepth = 0;
    let askDepth = 0;
    
    orderbook.bids.forEach(level => {
      if (level.price >= bidDepthThreshold) {
        bidDepth += level.quantity;
      }
    });
    
    orderbook.asks.forEach(level => {
      if (level.price <= askDepthThreshold) {
        askDepth += level.quantity;
      }
    });

    const imbalance = orderbook.totalBidVolume / (orderbook.totalAskVolume || 1);
    const totalVolume = orderbook.totalBidVolume + orderbook.totalAskVolume;

    // Calculate weighted mid price
    const weightedMidPrice = (
      (bestBidPrice * orderbook.totalAskVolume) + 
      (bestAskPrice * orderbook.totalBidVolume)
    ) / totalVolume;

    return {
      spread,
      spreadPercentage,
      bidDepth,
      askDepth,
      imbalance,
      totalVolume,
      weightedMidPrice: isNaN(weightedMidPrice) ? orderbook.midPrice : weightedMidPrice,
      lastUpdate: orderbook.timestamp,
    };
  };

  // Connect function
  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(clearOrderbook());

    try {
      await clientRef.current.connect();
    } catch (error) {
      dispatch(setError('Failed to connect to WebSocket'));
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (!clientRef.current) return;

    clientRef.current.disconnect();
    dispatch(setConnected(false));
    dispatch(setLoading(false));
    dispatch(clearOrderbook());
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    isLoading,
    error,
    client: clientRef.current,
  };
};

export default useWebSocket;

import { WebSocketManager } from './WebSocketManager';
import { BinanceWebSocketClient } from './BinanceWebSocketClient';
import { OkxWebSocketClient } from './OkxWebSocketClient';
import { BybitWebSocketClient } from './BybitWebsocketClient';
import { DeribitWebSocketClient } from './DeribitWebsocketClient';

// Create a single instance of the WebSocketManager
const webSocketManager = new WebSocketManager();

// Add clients for each venue
webSocketManager.addClient('binance', new BinanceWebSocketClient());
webSocketManager.addClient('okx', new OkxWebSocketClient());
webSocketManager.addClient('bybit',new BybitWebSocketClient());
webSocketManager.addClient('deribit',new DeribitWebSocketClient());
// Add other clients like Bybit, etc. here

export default webSocketManager;

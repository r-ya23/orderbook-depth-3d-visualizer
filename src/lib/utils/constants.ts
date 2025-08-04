// API Configuration
export const API_CONFIG = {
  DEFAULT_SYMBOL: process.env.NEXT_PUBLIC_DEFAULT_SYMBOL || "BTCUSDT",
  MAX_ORDERBOOK_LEVELS: parseInt(
    process.env.NEXT_PUBLIC_MAX_ORDERBOOK_LEVELS || "100"
  ),
  UPDATE_THROTTLE_MS: parseInt(
    process.env.NEXT_PUBLIC_UPDATE_THROTTLE_MS || "100"
  ),
  RECONNECT_DELAY: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  TARGET_FPS: parseInt(process.env.NEXT_PUBLIC_ANIMATION_FPS || "60"),
  MAX_PARTICLES: 10000,
  LOD_DISTANCE_THRESHOLD: 50,
  MEMORY_CLEANUP_INTERVAL: 30000, // 30 seconds
  STATS_UPDATE_INTERVAL: 1000, // 1 second
} as const;

// 3D Visualization Constants
export const VISUALIZATION_CONFIG = {
  SCENE: {
    BACKGROUND_COLOR: 0x0f0f0f,
    FOG_COLOR: 0x0f0f0f,
    FOG_NEAR: 50,
    FOG_FAR: 200,
  },
  CAMERA: {
    DEFAULT_POSITION: [10, 10, 10] as const,
    DEFAULT_TARGET: [0, 0, 0] as const,
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
  },
  GRID: {
    SIZE: 100,
    DIVISIONS: 20,
    COLOR_CENTER: 0x444444,
    COLOR_GRID: 0x222222,
  },
  AXES: {
    SIZE: 20,
    PRICE_COLOR: 0x3b82f6, // Blue for X-axis (price)
    QUANTITY_COLOR: 0x10b981, // Green for Y-axis (quantity)
    TIME_COLOR: 0x8b5cf6, // Purple for Z-axis (time)
  },
  ORDERBOOK: {
    BID_COLOR: 0x22c55e, // Green for bids
    ASK_COLOR: 0xef4444, // Red for asks
    MAX_HEIGHT: 10,
    MIN_HEIGHT: 0.1,
    TRANSPARENCY: 0.8,
    WIREFRAME: false,
  },
  PRESSURE_ZONES: {
    LOW_COLOR: 0x3b82f6, // Blue
    MEDIUM_COLOR: 0xf59e0b, // Yellow
    HIGH_COLOR: 0xef4444, // Red
    CRITICAL_COLOR: 0xdc2626, // Dark red
    TRANSPARENCY: 0.6,
  },
} as const;

// Color Schemes
export const COLOR_SCHEMES = {
  default: {
    bid: "#22c55e",
    ask: "#ef4444",
    background: "#0f0f0f",
    text: "#e5e5e5",
    muted: "#8a8a8a",
  },
  colorblind: {
    bid: "#0066cc",
    ask: "#ff6600",
    background: "#0f0f0f",
    text: "#e5e5e5",
    muted: "#8a8a8a",
  },
  monochrome: {
    bid: "#ffffff",
    ask: "#666666",
    background: "#000000",
    text: "#ffffff",
    muted: "#999999",
  },
} as const;

// Trading Configuration
export const TRADING_CONFIG = {
  SYMBOLS: [
    "BTCUSDT",
    "ETHUSDT",
    "ADAUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "DOTUSDT",
    "LINKUSDT",
    "AVAXUSDT",
  ],
  PRICE_PRECISION: {
    BTCUSDT: 2,
    ETHUSDT: 2,
    ADAUSDT: 6,
    BNBUSDT: 2,
    SOLUSDT: 3,
    DOTUSDT: 3,
    LINKUSDT: 3,
    AVAXUSDT: 3,
  },
  QUANTITY_PRECISION: {
    BTCUSDT: 5,
    ETHUSDT: 4,
    ADAUSDT: 0,
    BNBUSDT: 2,
    SOLUSDT: 1,
    DOTUSDT: 1,
    LINKUSDT: 1,
    AVAXUSDT: 2,
  },
} as const;

// Time Ranges
export const TIME_RANGES = {
  "1m": { duration: 60 * 1000, label: "1 Minute" },
  "5m": { duration: 5 * 60 * 1000, label: "5 Minutes" },
  "15m": { duration: 15 * 60 * 1000, label: "15 Minutes" },
  "1h": { duration: 60 * 60 * 1000, label: "1 Hour" },
  "4h": { duration: 4 * 60 * 60 * 1000, label: "4 Hours" },
  "1d": { duration: 24 * 60 * 60 * 1000, label: "1 Day" },
} as const;

// Animation Constants
export const ANIMATION_CONFIG = {
  ROTATION_SPEED: 0.01,
  TRANSITION_DURATION: 300,
  FADE_DURATION: 200,
  SPRING_CONFIG: {
    tension: 280,
    friction: 60,
  },
  EASING: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

// Pressure Zone Detection
export const PRESSURE_ZONE_CONFIG = {
  VOLUME_THRESHOLD_MULTIPLIER: 2, // 2x average volume
  CLUSTERING_DISTANCE: 0.001, // 0.1% price distance
  MIN_LEVELS_FOR_ZONE: 3,
  CONFIDENCE_THRESHOLD: 0.7,
  INTENSITY_CALCULATION: {
    VOLUME_WEIGHT: 0.6,
    DENSITY_WEIGHT: 0.3,
    TIME_WEIGHT: 0.1,
  },
} as const;

// Feature Flags
export const FEATURES = {
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  PRESSURE_ZONES: process.env.NEXT_PUBLIC_ENABLE_PRESSURE_ZONES === "true",
  ML_PREDICTION: process.env.NEXT_PUBLIC_ENABLE_ML_PREDICTION === "true",
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
  PERFORMANCE_MONITORING: true,
  ACCESSIBILITY: true,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WEBSOCKET_CONNECTION: "Failed to connect to market data stream",
  WEBSOCKET_RECONNECT: "Attempting to reconnect to market data...",
  WEBGL_NOT_SUPPORTED: "WebGL is not supported in your browser",
  WEBGL_CONTEXT_LOST: "WebGL context was lost. Please refresh the page.",
  DATA_VALIDATION: "Invalid orderbook data received",
  MEMORY_LIMIT: "Memory usage is too high. Some features may be disabled.",
  PERFORMANCE_DEGRADED:
    "Performance degraded. Consider reducing quality settings.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  WEBSOCKET_CONNECTED: "Connected to market data stream",
  DATA_SYNC_COMPLETE: "Orderbook data synchronized",
  SETTINGS_SAVED: "Settings saved successfully",
  EXPORT_COMPLETE: "Data exported successfully",
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_CONTROL_PANEL: "c",
  TOGGLE_STATS: "s",
  TOGGLE_FULLSCREEN: "f",
  RESET_CAMERA: "r",
  TOGGLE_AUTO_ROTATE: "a",
  TOGGLE_GRID: "g",
  TOGGLE_AXES: "x",
  SCREENSHOT: "p",
} as const;

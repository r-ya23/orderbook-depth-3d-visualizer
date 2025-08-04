"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import { isWebGLSupported } from "@/lib/utils";
import LoadingSpinner, { LoadingOverlay } from "@/components/ui/LoadingSpinner";
import { AlertTriangle, Monitor } from "lucide-react";

// Placeholder components - we'll create these in subsequent phases
const OrderbookVisualization = React.lazy(() =>
  import("@/components/visualization/OrderbookScene").catch(() => ({
    default: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            3D Scene Loading...
          </h3>
          <p className="text-gray-400">
            The visualization will appear here in Phase 2
          </p>
        </div>
      </div>
    ),
  }))
);

const ControlPanel = React.lazy(() =>
  import("@/components/layout/ControlPanel").catch(() => ({
    default: () => (
      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
        <p className="text-gray-400 text-sm">
          Control panel will be implemented in Phase 2
        </p>
      </div>
    ),
  }))
);

import { useWebSocket } from "@/hooks/useWebSocket";
import AsksBids from "@/components/table/AsksBids";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const { isConnected, error } = useAppSelector((state) => state.orderbook);
  const { venues } = useAppSelector((state) => state.filters);
  const { showControlPanel } = useAppSelector((state) => state.settings.ui);

  // Initialize WebSocket for all active venues
  Object.keys(venues).forEach((venue) => {
    if (venues[venue as keyof typeof venues].enabled) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useWebSocket({ venue });
    }
  });

  useEffect(() => {
    // Check WebGL support
    setWebglSupported(isWebGLSupported());

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!webglSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-gray-800 border border-yellow-500/20 rounded-xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Monitor className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                WebGL Not Supported
              </h2>
              <p className="text-gray-400 text-sm">
                3D visualization requires WebGL
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <p>
              Your browser or device doesn't support WebGL, which is required
              for the 3D orderbook visualization.
            </p>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">
                To enable WebGL:
              </h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Update your browser to the latest version</li>
                <li>• Enable hardware acceleration in browser settings</li>
                <li>• Update your graphics drivers</li>
                <li>• Try a different browser (Chrome, Firefox, Edge)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              3D Orderbook Visualizer
            </h1>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm text-gray-400">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Phase 1: Foundation Complete
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div>
          <AsksBids/>
        </div>
        {/* 3D Visualization Area */}
        <div className="flex-1 relative bg-gray-950">
          <React.Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner
                  variant="orderbook"
                  message="Initializing 3D scene..."
                />
              </div>
            }
          >
            <div>
              <OrderbookVisualization />
            </div>
          </React.Suspense>

          {/* Error Display */}
          {error && (
            <div className="absolute top-4 right-4 bg-red-900/90 border border-red-500/20 rounded-lg p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">
                  Connection Error
                </span>
              </div>
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        {showControlPanel && (
          <React.Suspense
            fallback={
              <div className="w-80 bg-gray-900 border-l border-gray-700 flex items-center justify-center">
                <LoadingSpinner message="Loading controls..." />
              </div>
            }
          >
            <ControlPanel />
          </React.Suspense>
        )}
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isLoading}
        message="Initializing 3D Orderbook Visualizer..."
      />

      {/* Status Bar */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Ready for Phase 2: 3D Scene Implementation</span>
          </div>
          <div className="flex items-center gap-4">
            <span>WebGL: Supported</span>
            <span>FPS: 60</span>
            <span>Build: v1.0.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

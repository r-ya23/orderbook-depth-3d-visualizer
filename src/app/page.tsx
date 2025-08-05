"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import WebSocketHandler from "@/lib/utils/WebsocketHandler"; // new
import LoadingSpinner, { LoadingOverlay } from "@/components/ui/LoadingSpinner";
import { isWebGLSupported } from "@/lib/utils";
import AsksBids from "@/components/table/AsksBids";
import { AlertTriangle } from "lucide-react";
import ControlPanel from "@/components/layout/ControlPanel";
import { useSelector } from "react-redux";
import { setShowNoVenuePopup } from "@/store/filterslice";
// ...other imports

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

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const showNoVenuePopup = useAppSelector(
    (state) => state.filters.showNoVenuePopup
  );


  const { isConnected, error } = useAppSelector((state) => state.orderbook);
  const { venues } = useAppSelector((state) => state.filters);
  const { showControlPanel } = useAppSelector((state) => state.settings.ui);

  const enabledVenues = Object.keys(venues).filter(
    (venue) => venues[venue as keyof typeof venues].enabled
  );

  useEffect(() => {
    setWebglSupported(isWebGLSupported());
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!webglSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        {/* WebGL fallback UI */}
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {/* Header UI */}
      <header>{/* ... */}</header>

      <div className="flex-1 flex">
        <div>
          <AsksBids />
        </div>
        <div className="flex-1 relative bg-gray-950">
          <React.Suspense
            fallback={<LoadingSpinner message="Initializing 3D scene..." />}
          >
            <OrderbookVisualization />
          </React.Suspense>

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

        {showControlPanel && (
          <React.Suspense
            fallback={<LoadingSpinner message="Loading controls..." />}
          >
            <ControlPanel />
          </React.Suspense>
        )}
      </div>

      <LoadingOverlay
        isVisible={isLoading}
        message="Initializing 3D Orderbook Visualizer..."
      />

      <footer>{/* Footer UI */}</footer>

      {/* No Venue Popup */}
      {showNoVenuePopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-yellow-500 text-black text-sm font-medium rounded-md shadow-lg z-50">
          Please select at least one venue to connect.
        </div>
      )}

      {/* WebSocket Handlers for Enabled Venues */}
      {enabledVenues.map((venue) => (
        <WebSocketHandler key={venue} venue={venue} />
      ))
      }
    </main>
  );
}

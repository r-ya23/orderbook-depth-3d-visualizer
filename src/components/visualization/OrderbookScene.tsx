"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import OrderbookBars from "./OrderbookBars";
import OrderbookDepthChart from "../ui/DepthChart";
import ViewToggle from "../ui/ViewToggle";
import ControlPanel from "../ui/ControlPanel";

const OrderbookScene = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { viewMode, showStats, showControlPanel } = useSelector(
    (state: RootState) => state.settings.ui
  );

  // Handle context loss and restoration
  const handleContextLost = useCallback((event: WebGLContextEvent) => {
    console.warn("WebGL context lost!");
    event.preventDefault();
  }, []);

  const handleContextRestored = useCallback(() => {
    // Optionally trigger a re-render or state update here
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener(
        "webglcontextlost",
        handleContextLost as EventListener
      );
      canvas.addEventListener(
        "webglcontextrestored",
        handleContextRestored as EventListener
      );

      return () => {
        canvas.removeEventListener(
          "webglcontextlost",
          handleContextLost as EventListener
        );
        canvas.removeEventListener(
          "webglcontextrestored",
          handleContextRestored as EventListener
        );
      };
    }
  }, [handleContextLost, handleContextRestored]);

  return (
    <div style={{ width: "100%", height: "100vh" }} ref={canvasRef}>
      {/* View Toggle */}
      <ViewToggle />

      {/* Control Panel */}
      {showControlPanel && <ControlPanel />}

      {/* Conditional rendering based on view mode */}
      {viewMode === "2d" ? (
        <OrderbookDepthChart />
      ) : (
        <Canvas
          camera={{
            position: [15, 10, 15],
            fov: 75,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 2]}
        >
          {/* Enhanced lighting for 3D scene */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.7} />
          <pointLight
            position={[-10, 10, -10]}
            intensity={0.3}
            color="#0088ff"
          />
          <pointLight position={[10, 10, 10]} intensity={0.3} color="#ff8800" />

          {/* 3D Orderbook Bars */}
          <OrderbookBars />

          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            target={[0, 4, 0]}
            maxDistance={50}
            minDistance={5}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
          />

          {/* Stats for development and when enabled */}
          {(process.env.NODE_ENV === "development" || showStats) && <Stats />}
        </Canvas>
      )}
    </div>
  );
};

export default OrderbookScene;

"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { Canvas, RootState } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import OrderbookBars from "./OrderbookBars";
import OrderbookDepthChart from "../ui/DepthChart";

const OrderbookScene = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

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
      <OrderbookDepthChart />

      <Canvas
        camera={{
          position: [15, 10, 15],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: false, // Disable antialiasing to save memory
          alpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]} // Limit device pixel ratio
      >
        {/* Simplified lighting to reduce GPU load */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        {/* <OrderbookBars /> */}

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          target={[5, 5, 0]}
          maxDistance={50}
          minDistance={5}
        />

        {/* Only show stats in development */}
        {process.env.NODE_ENV === "development" && <Stats />}
      </Canvas>
    </div>
  );
};

export default OrderbookScene;

"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { Canvas, RootState } from "@react-three/fiber";
import { Grid, OrbitControls, Stats, Text } from "@react-three/drei";
import OrderbookBars from "./OrderbookBars";
import SimpleLabeledAxes from "./LabeledAxes";
import CSS3DAxes from "./CSS3DAxes";
import * as THREE from "three";
import OrderbookDepthChart from "../ui/DepthChart";

const OrderbookScene = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);

  // Handle context loss and restoration
  const handleContextLost = useCallback((event: any) => {
    console.warn("WebGL context lost!");
    event.preventDefault();
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log("WebGL context restored");
    // Optionally trigger a re-render or state update here
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      return () => {
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener(
          "webglcontextrestored",
          handleContextRestored
        );
      };
    }
  }, [handleContextLost, handleContextRestored]);

  const handleCanvasCreated = useCallback(
    ({ gl, scene, camera }: RootState) => {
      console.log("Canvas created, WebGL context:", gl.getContext());
      rendererRef.current = gl;

      // Configure renderer for better memory management
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
      gl.setClearColor(0x000000, 1);

      // Enable context loss simulation in development (remove in production)
      // const ext = gl.getExtension('WEBGL_lose_context');
      // if (ext) console.log('WEBGL_lose_context extension available');
    },
    []
  );

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
        onCreated={handleCanvasCreated}
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
        
        {/* Your components */}
        {/* <OrderbookBars/> */}

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

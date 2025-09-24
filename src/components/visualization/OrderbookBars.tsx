"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface BarData {
  price: number;
  quantity: number;
  targetHeight: number;
  currentHeight: number;
  type: "bid" | "ask";
  age: number;
}

const OrderbookBars = () => {
  const { snapshot } = useSelector((state: RootState) => state.orderbook);
  const { autoRotate, rotationSpeed } = useSelector(
    (state: RootState) => state.settings.visualization
  );
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const [barData, setBarData] = useState<BarData[]>([]);
  const animationSpeed = 0.1;

  // Refs to store geometries and materials for cleanup
  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    // Auto-rotate if enabled
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += rotationSpeed * 0.01 * delta;
    }

    // Animate bar heights smoothly
    setBarData((prevData) =>
      prevData.map((bar) => ({
        ...bar,
        currentHeight: THREE.MathUtils.lerp(
          bar.currentHeight,
          bar.targetHeight,
          animationSpeed
        ),
        age: bar.age + delta,
      }))
    );
  });

  // Cleanup function
  useEffect(() => {
    return () => {
      // Dispose of all geometries and materials
      geometriesRef.current.forEach((geometry) => {
        if (geometry && geometry.dispose) geometry.dispose();
      });
      materialsRef.current.forEach((material) => {
        if (material && material.dispose) material.dispose();
      });

      geometriesRef.current = [];
      materialsRef.current = [];
    };
  }, []);

  // Update bar data when snapshot changes
  useEffect(() => {
    if (!snapshot) return;

    const bids = Array.from(snapshot.bids.values()).flat();
    const asks = Array.from(snapshot.asks.values()).flat();

    // Limit the number of items to prevent memory issues
    const maxItems = 50;
    const limitedBids = bids.slice(0, maxItems);
    const limitedAsks = asks.slice(0, maxItems);

    // Calculate ranges
    const allPrices = [...limitedBids, ...limitedAsks].map(
      (level) => level?.price || 0
    );
    const allQuantities = [...limitedBids, ...limitedAsks].map(
      (level) => level?.quantity || 0
    );

    if (allPrices.length === 0 || allQuantities.length === 0) return;

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;
    const maxQuantity = Math.max(...allQuantities) || 1;

    // Create new bar data with smooth transitions
    const newBarData: BarData[] = [];

    // Process bids
    limitedBids.forEach((level, index) => {
      if (
        level &&
        typeof level.price === "number" &&
        typeof level.quantity === "number"
      ) {
        const existingBar = barData.find(
          (bar) =>
            Math.abs(bar.price - level.price) < 0.01 && bar.type === "bid"
        );

        newBarData.push({
          price: level.price,
          quantity: level.quantity,
          targetHeight: Math.max((level.quantity / maxQuantity) * 8, 0.2),
          currentHeight: existingBar ? existingBar.currentHeight : 0.2,
          type: "bid",
          age: existingBar ? existingBar.age : 0,
        });
      }
    });

    // Process asks
    limitedAsks.forEach((level, index) => {
      if (
        level &&
        typeof level.price === "number" &&
        typeof level.quantity === "number"
      ) {
        const existingBar = barData.find(
          (bar) =>
            Math.abs(bar.price - level.price) < 0.01 && bar.type === "ask"
        );

        newBarData.push({
          price: level.price,
          quantity: level.quantity,
          targetHeight: Math.max((level.quantity / maxQuantity) * 8, 0.2),
          currentHeight: existingBar ? existingBar.currentHeight : 0.2,
          type: "ask",
          age: existingBar ? existingBar.age : 0,
        });
      }
    });

    setBarData(newBarData);
  }, [snapshot]);

  // Memoized data processing for positioning
  const processedData = useMemo(() => {
    if (barData.length === 0) return null;

    const allPrices = barData.map((bar) => bar.price);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    return {
      minPrice,
      maxPrice,
      priceRange,
      barData,
    };
  }, [barData]);

  // Shared geometry to reduce memory usage
  const sharedGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.3, 1, 0.3);
    geometriesRef.current.push(geo);
    return geo;
  }, []);

  if (
    !processedData ||
    !processedData.barData ||
    processedData.barData.length === 0
  ) {
    return null;
  }

  const { minPrice, priceRange, barData: bars } = processedData;

  return (
    <group ref={groupRef}>
      {/* Grid lines for better depth perception */}
      <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, 0, 0]} />

      {/* Bars */}
      {bars.map((bar, index) => {
        if (
          !bar ||
          typeof bar.price !== "number" ||
          typeof bar.currentHeight !== "number"
        ) {
          return null;
        }

        const xPosition = ((bar.price - minPrice) / priceRange) * 16 - 8;
        const zPosition = bar.type === "bid" ? -index * 0.1 : index * 0.1;

        // Add some visual effects based on age
        const ageOpacity = Math.max(0.3, 1 - bar.age * 0.1);
        const pulseIntensity =
          Math.sin(timeRef.current * 3 + index * 0.5) * 0.1 + 0.9;

        return (
          <group key={`${bar.type}-${bar.price}-${index}`}>
            <mesh
              position={[xPosition, bar.currentHeight / 2, zPosition]}
              scale={[1, bar.currentHeight, 1]}
              geometry={sharedGeometry}
            >
              <meshStandardMaterial
                color={bar.type === "bid" ? "#00ff88" : "#ff4444"}
                transparent={true}
                opacity={ageOpacity * pulseIntensity}
                emissive={bar.type === "bid" ? "#004422" : "#440000"}
                emissiveIntensity={0.2 * pulseIntensity}
              />
            </mesh>

            {/* Price labels for significant levels */}
            {bar.quantity > 1 && index % 5 === 0 && (
              <Text
                position={[xPosition, bar.currentHeight + 0.5, zPosition]}
                fontSize={0.3}
                color={bar.type === "bid" ? "#00ff88" : "#ff4444"}
                anchorX="center"
                anchorY="middle"
              >
                ${bar.price.toFixed(0)}
              </Text>
            )}
          </group>
        );
      })}

      {/* Central price line */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 16]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>

      {/* Volume indicators */}
      <Text
        position={[-9, 8, 0]}
        fontSize={0.5}
        color="#00ff88"
        anchorX="left"
        anchorY="middle"
      >
        BIDS
      </Text>
      <Text
        position={[9, 8, 0]}
        fontSize={0.5}
        color="#ff4444"
        anchorX="right"
        anchorY="middle"
      >
        ASKS
      </Text>
    </group>
  );
};

export default OrderbookBars;

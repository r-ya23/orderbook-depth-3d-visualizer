"use client";
import React, { useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const OrderbookBars = () => {
  const { snapshot } = useSelector((state: RootState) => state.orderbook);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Refs to store geometries and materials for cleanup
  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    if (groupRef.current) {
      // groupRef.current.rotation.y += 0.001; // Reduced rotation speed
    }
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

  // Memoized data processing to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!snapshot) return null;

    const bids = Array.from(snapshot.bids.values()).flat();
    const asks = Array.from(snapshot.asks.values()).flat();

    // Limit the number of items to prevent memory issues
    const maxItems = 100;
    const limitedBids = bids.slice(0, maxItems);
    const limitedAsks = asks.slice(0, maxItems);

    // Calculate ranges
    const allPrices = [...limitedBids, ...limitedAsks].map(
      (level) => level?.price || 0
    );
    const allQuantities = [...limitedBids, ...limitedAsks].map(
      (level) => level?.quantity || 0
    );

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
    const maxQuantity = Math.max(...allQuantities) || 1;

    return {
      bids: limitedBids,
      asks: limitedAsks,
      minPrice,
      maxPrice,
      priceRange,
      maxQuantity,
    };
  }, [snapshot]);

  // Shared geometry and materials to reduce memory usage
  const sharedGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.2, 1, 0.2);
    geometriesRef.current.push(geo);
    return geo;
  }, []);

  const bidMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "green",
      transparent: true,
      opacity: 0.8,
    });
    materialsRef.current.push(mat);
    return mat;
  }, []);

  const askMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "red",
      transparent: true,
      opacity: 0.8,
    });
    materialsRef.current.push(mat);
    return mat;
  }, []);

  if (!processedData) {
    console.log("No snapshot available");
    return null;
  }

  const { bids, asks, minPrice, priceRange, maxQuantity } = processedData;

  return (
    <group ref={groupRef}>
      {/* Bids */}
      {bids.map((level, index) => {
        if (
          !level ||
          typeof level.price !== "number" ||
          typeof level.quantity !== "number"
        ) {
          return null;
        }

        const position = [
          ((level.price - minPrice) / priceRange) * 10,
          (level.quantity / maxQuantity) * 5, // Reduced height multiplier
          -index * 0.05, // Closer spacing
        ] as const;

        const scale = [1, Math.max((level.quantity / maxQuantity) * 2, 0.1), 1]as const;

        return (
          <mesh
            key={`bid-${index}`}
            position={position}
            scale={scale}
            geometry={sharedGeometry}
            material={bidMaterial}
          />
        );
      })}

      {/* Asks */}
      {asks.map((level, index) => {
        if (
          !level ||
          typeof level.price !== "number" ||
          typeof level.quantity !== "number"
        ) {
          return null;
        }

        const position = [
          ((level.price - minPrice) / priceRange) * 10,
          (level.quantity / maxQuantity) * 5,
          index * 0.05,
        ] as const;

        const scale = [1, Math.max((level.quantity / maxQuantity) * 2, 0.1), 1]as const;

        return (
          <mesh
            key={`ask-${index}`}
            position={position}
            scale={scale}
            geometry={sharedGeometry}
            material={askMaterial}
          />
        );
      })}

    </group>
  );
};

export default OrderbookBars;

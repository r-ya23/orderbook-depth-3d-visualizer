import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface OrderBarProps {
  position: [number, number, number];
  height: number;
  color: string;
  venueColor: string;
  price: number;
  opacity: number;
}

const BAR_WIDTH = 0.4;
const BAR_DEPTH = 0.8;

// FIX: Replaced React.FC with standard functional component syntax for better type inference with @react-three/fiber's custom JSX elements.
const OrderBar = ({
  position,
  height,
  color,
  venueColor,
  price,
  opacity,
}: OrderBarProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [currentHeight, setCurrentHeight] = useState(height);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // This allows the initial height to be set without animation
    setCurrentHeight(height);
  }, [height]);

  useFrame(() => {
    if (meshRef.current) {
      const targetHeight = height;
      const lerpedHeight = THREE.MathUtils.lerp(
        currentHeight,
        targetHeight,
        0.1
      );
      setCurrentHeight(lerpedHeight);

      meshRef.current.scale.y = lerpedHeight;
      meshRef.current.position.y = lerpedHeight / 2;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <boxGeometry args={[BAR_WIDTH, 1, BAR_DEPTH]} />
        <meshStandardMaterial
          color={color}
          emissive={isHovered ? venueColor : color}
          emissiveIntensity={isHovered ? 1.5 : 0.4}
          toneMapped={false}
          metalness={0.1}
          roughness={0.6}
          transparent
          opacity={opacity}
        />
      </mesh>
      {isHovered && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {`Qty: ${height.toFixed(2)}\nPrice: ${price.toFixed(2)}`}
        </Text>
      )}
    </group>
  );
};

export default OrderBar;

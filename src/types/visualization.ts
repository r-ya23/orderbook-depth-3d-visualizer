import { Vector3 } from "three";

export interface VisualizationSettings {
  autoRotate: boolean;
  rotationSpeed: number;
  showGrid: boolean;
  showAxes: boolean;
  showPressureZones: boolean;
  showVolumeProfile: boolean;
  theme: "dark" | "light";
  colorScheme: "default" | "colorblind" | "monochrome";
  transparency: number;
  levelOfDetail: "low" | "medium" | "high";
}

export interface CameraSettings {
  position: Vector3;
  target: Vector3;
  fov: number;
  near: number;
  far: number;
  enableDamping: boolean;
  dampingFactor: number;
  enableZoom: boolean;
  enablePan: boolean;
  enableRotate: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export interface VisualizationBounds {
  minPrice: number;
  maxPrice: number;
  minQuantity: number;
  maxQuantity: number;
  timeRange: number; // milliseconds
}

export interface OrderbookMeshData {
  positions: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
  normals: Float32Array;
  uvs: Float32Array;
  instanceCount: number;
}

export interface VisualizationFilters {
  priceRange: [number, number];
  quantityThreshold: number;
  timeRange: number;
  venues: string[];
  showBids: boolean;
  showAsks: boolean;
}

export interface ViewMode {
  id: string;
  name: string;
  description: string;
  settings: Partial<VisualizationSettings>;
}

export const VIEW_MODES: ViewMode[] = [
  {
    id: "realtime",
    name: "Real-time",
    description: "Live orderbook with continuous updates",
    settings: {
      autoRotate: true,
      rotationSpeed: 1,
      showPressureZones: true,
    },
  },
  {
    id: "historical",
    name: "Historical",
    description: "Historical orderbook analysis",
    settings: {
      autoRotate: false,
      showVolumeProfile: true,
      showPressureZones: true,
    },
  },
  {
    id: "pressure",
    name: "Pressure Zones",
    description: "Focus on high-pressure areas",
    settings: {
      showPressureZones: true,
      showVolumeProfile: false,
      transparency: 0.7,
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean view with essential data only",
    settings: {
      showGrid: false,
      showAxes: true,
      showPressureZones: false,
      levelOfDetail: "low",
    },
  },
];

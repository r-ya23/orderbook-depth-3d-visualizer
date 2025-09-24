import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vector3 } from "three";
import { VisualizationSettings, CameraSettings } from "@/types/visualization";

interface SettingsState {
  visualization: VisualizationSettings;
  camera: CameraSettings;
  performance: {
    targetFPS: number;
    enableLOD: boolean;
    maxParticles: number;
    renderDistance: number;
  };
  ui: {
    showControlPanel: boolean;
    showStats: boolean;
    showTooltips: boolean;
    panelPosition: "left" | "right";
    viewMode: "2d" | "3d";
  };
}

const initialState: SettingsState = {
  visualization: {
    autoRotate: true,
    rotationSpeed: 1,
    showGrid: true,
    showAxes: true,
    showPressureZones: true,
    showVolumeProfile: false,
    theme: "dark",
    colorScheme: "default",
    transparency: 0.8,
    levelOfDetail: "medium",
  },
  camera: {
    position: new Vector3(10, 10, 10),
    target: new Vector3(0, 0, 0),
    fov: 75,
    near: 0.1,
    far: 1000,
    enableDamping: true,
    dampingFactor: 0.05,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    autoRotate: true,
    autoRotateSpeed: 2,
  },
  performance: {
    targetFPS: 60,
    enableLOD: true,
    maxParticles: 10000,
    renderDistance: 100,
  },
  ui: {
    showControlPanel: true,
    showStats: false,
    showTooltips: true,
    panelPosition: "right",
    viewMode: "3d",
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateVisualizationSettings: (
      state,
      action: PayloadAction<Partial<VisualizationSettings>>
    ) => {
      state.visualization = { ...state.visualization, ...action.payload };
    },

    updateCameraSettings: (
      state,
      action: PayloadAction<Partial<CameraSettings>>
    ) => {
      state.camera = { ...state.camera, ...action.payload };
    },

    setTheme: (state, action: PayloadAction<"dark" | "light">) => {
      state.visualization.theme = action.payload;
    },

    toggleAutoRotate: (state) => {
      state.visualization.autoRotate = !state.visualization.autoRotate;
      state.camera.autoRotate = state.visualization.autoRotate;
    },

    setRotationSpeed: (state, action: PayloadAction<number>) => {
      state.visualization.rotationSpeed = action.payload;
      state.camera.autoRotateSpeed = action.payload;
    },

    toggleGrid: (state) => {
      state.visualization.showGrid = !state.visualization.showGrid;
    },

    toggleAxes: (state) => {
      state.visualization.showAxes = !state.visualization.showAxes;
    },

    togglePressureZones: (state) => {
      state.visualization.showPressureZones =
        !state.visualization.showPressureZones;
    },

    toggleVolumeProfile: (state) => {
      state.visualization.showVolumeProfile =
        !state.visualization.showVolumeProfile;
    },

    setTransparency: (state, action: PayloadAction<number>) => {
      state.visualization.transparency = Math.max(
        0,
        Math.min(1, action.payload)
      );
    },

    setLevelOfDetail: (
      state,
      action: PayloadAction<"low" | "medium" | "high">
    ) => {
      state.visualization.levelOfDetail = action.payload;
    },

    updatePerformanceSettings: (
      state,
      action: PayloadAction<Partial<SettingsState["performance"]>>
    ) => {
      state.performance = { ...state.performance, ...action.payload };
    },

    updateUISettings: (
      state,
      action: PayloadAction<Partial<SettingsState["ui"]>>
    ) => {
      state.ui = { ...state.ui, ...action.payload };
    },

    toggleControlPanel: (state) => {
      state.ui.showControlPanel = !state.ui.showControlPanel;
    },

    toggleStats: (state) => {
      state.ui.showStats = !state.ui.showStats;
    },

    toggleViewMode: (state) => {
      state.ui.viewMode = state.ui.viewMode === "2d" ? "3d" : "2d";
    },

    setViewMode: (state, action: PayloadAction<"2d" | "3d">) => {
      state.ui.viewMode = action.payload;
    },

    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const {
  updateVisualizationSettings,
  updateCameraSettings,
  setTheme,
  toggleAutoRotate,
  setRotationSpeed,
  toggleGrid,
  toggleAxes,
  togglePressureZones,
  toggleVolumeProfile,
  setTransparency,
  setLevelOfDetail,
  updatePerformanceSettings,
  updateUISettings,
  toggleControlPanel,
  toggleStats,
  toggleViewMode,
  setViewMode,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

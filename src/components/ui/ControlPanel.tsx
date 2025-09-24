"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  toggleAutoRotate,
  setRotationSpeed,
  toggleStats,
  toggleViewMode,
} from "@/store/settingslice";

const ControlPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { visualization, ui } = useSelector(
    (state: RootState) => state.settings
  );
  const { isConnected, updateCount } = useSelector(
    (state: RootState) => state.orderbook
  );

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-600 min-w-64">
      <h3 className="text-white font-semibold mb-3">Controls</h3>

      {/* Connection Status */}
      <div className="mb-3 flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-sm text-gray-300">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        <span className="text-xs text-gray-400">({updateCount} updates)</span>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-3">
        <label className="text-sm text-gray-300 block mb-1">View Mode</label>
        <button
          onClick={() => dispatch(toggleViewMode())}
          className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
            ui.viewMode === "3d"
              ? "bg-blue-600 text-white"
              : "bg-gray-600 text-gray-300"
          }`}
        >
          {ui.viewMode === "3d" ? "3D Bars" : "2D Depth Chart"}
        </button>
      </div>

      {/* 3D Controls - only show when in 3D mode */}
      {ui.viewMode === "3d" && (
        <>
          {/* Auto Rotate */}
          <div className="mb-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visualization.autoRotate}
                onChange={() => dispatch(toggleAutoRotate())}
                className="rounded"
              />
              <span className="text-sm text-gray-300">Auto Rotate</span>
            </label>
          </div>

          {/* Rotation Speed */}
          {visualization.autoRotate && (
            <div className="mb-3">
              <label className="text-sm text-gray-300 block mb-1">
                Rotation Speed: {visualization.rotationSpeed}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={visualization.rotationSpeed}
                onChange={(e) =>
                  dispatch(setRotationSpeed(parseFloat(e.target.value)))
                }
                className="w-full"
              />
            </div>
          )}

          {/* Show Stats */}
          <div className="mb-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={ui.showStats}
                onChange={() => dispatch(toggleStats())}
                className="rounded"
              />
              <span className="text-sm text-gray-300">
                Show Performance Stats
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default ControlPanel;

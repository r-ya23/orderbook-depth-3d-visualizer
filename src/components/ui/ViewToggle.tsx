"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleViewMode } from "@/store/settingslice";

const ViewToggle: React.FC = () => {
  const dispatch = useDispatch();
  const { viewMode } = useSelector((state: RootState) => state.settings.ui);

  const handleToggle = () => {
    dispatch(toggleViewMode());
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-600">
      <div className="flex items-center space-x-2">
        <span className="text-white text-sm font-medium">View:</span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            viewMode === "3d" ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
              viewMode === "3d" ? "translate-x-9" : "translate-x-1"
            }`}
          />
        </button>
        <div className="flex flex-col text-xs text-gray-300">
          <span className={viewMode === "2d" ? "text-white font-semibold" : ""}>
            2D
          </span>
          <span className={viewMode === "3d" ? "text-white font-semibold" : ""}>
            3D
          </span>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400 text-center">
        {viewMode === "2d" ? "Depth Chart" : "3D Bars"}
      </div>
    </div>
  );
};

export default ViewToggle;

"use client";

import React from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "orderbook" | "minimal";
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  message,
  className,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2
          className={cn("animate-spin text-blue-500", sizeClasses[size])}
        />
      </div>
    );
  }

  if (variant === "orderbook") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center space-y-4 p-8",
          className
        )}
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <TrendingUp className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">
            Loading Orderbook Data
          </h3>
          <p className="text-gray-400 text-sm">
            {message || "Connecting to market data streams..."}
          </p>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-3",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin text-blue-500", sizeClasses[size])}
      />
      {message && (
        <p className="text-sm text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );
};

// Full screen loading overlay
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
}> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-2xl">
        <LoadingSpinner variant="orderbook" size="lg" message={message} />
      </div>
    </div>
  );
};

export default LoadingSpinner;

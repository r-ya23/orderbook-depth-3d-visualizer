import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers for display
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(decimals) + "B";
  }
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(decimals) + "M";
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(decimals) + "K";
  }
  return value.toFixed(decimals);
};

// Format price with appropriate decimal places
export const formatPrice = (
  price: number,
  symbol: string = "BTCUSDT"
): string => {
  if (symbol.includes("USDT") || symbol.includes("USD")) {
    if (price >= 1) {
      return price.toFixed(2);
    }
    return price.toFixed(6);
  }
  return price.toFixed(8);
};

// Format quantity with appropriate decimal places
export const formatQuantity = (quantity: number): string => {
  if (quantity >= 1000) {
    return formatNumber(quantity, 2);
  }
  if (quantity >= 1) {
    return quantity.toFixed(3);
  }
  return quantity.toFixed(6);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Format time
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// // Debounce function
// export const debounce = <T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): ((...args: Parameters<T>) => void) => {
//   let timeout: NodeJS.Timeout;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// // Throttle function
// export const throttle = <T extends (...args: any[]) => any>(
//   func: T,
//   limit: number
// ): ((...args: Parameters<T>) => void) => {
//   let inThrottle: boolean;
//   return (...args: Parameters<T>) => {
//     if (!inThrottle) {
//       func(...args);
// inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// };

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if WebGL is supported
export const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
};

// Get WebGL info
export const getWebGLInfo = () => {
  const canvas = document.createElement("canvas");
  const gl =
    (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext;

  if (!gl) {
    return null;
  }

  return {
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    version: gl.getParameter(gl.VERSION),
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
  };
};

// Color utilities
export const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof performance !== "undefined") {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<string | number, T[]>
  );
};

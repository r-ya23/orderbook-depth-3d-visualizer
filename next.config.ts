import type { NextConfig } from "next";
import { Configuration } from "webpack";

const isAnalyze = process.env.ANALYZE === "true";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
  },

  webpack: (config: Configuration, { isServer }) => {
    // Handle Three.js and WebGL optimizations
    config.module?.rules?.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });

    // Optimize for client-side Three.js
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          path: false,
          crypto: false,
        },
      };
    }

    if (!isServer && isAnalyze) {
      const BundleAnalyzerPlugin = require("@next/bundle-analyzer")()
        .BundleAnalyzerPlugin;
      config.plugins?.push(new BundleAnalyzerPlugin());
    }

    return config;
  },

  images: {
    domains: [],
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use /tmp locally to avoid iCloud Drive sync slowness; Vercel uses .next
  distDir: process.env.VERCEL ? ".next" : "/tmp/vendor-web-next",
  // Required: workspace packages expose raw .ts source — SWC must transpile them
  transpilePackages: ["@gomarket/ui", "@gomarket/shared-types", "@gomarket/api-client"],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;

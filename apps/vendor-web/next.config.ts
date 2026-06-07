import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: "/tmp/vendor-web-next",
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;

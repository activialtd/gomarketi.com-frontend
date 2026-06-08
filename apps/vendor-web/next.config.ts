import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use /tmp locally to avoid iCloud Drive sync slowness; Vercel uses .next
  distDir: process.env.VERCEL ? ".next" : "/tmp/vendor-web-next",
  // Required: workspace packages expose raw .ts source — SWC/Turbopack must transpile them
  transpilePackages: ["@gomarket/ui", "@gomarket/shared-types", "@gomarket/api-client"],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    // Only set root to monorepo root for local dev so Turbopack watches across packages.
    // On Vercel, pnpm symlinks workspace deps into apps/vendor-web/node_modules, not the
    // monorepo root, so setting root here breaks @gomarket/* resolution entirely.
    ...(process.env.VERCEL ? {} : { root: path.resolve(__dirname, "../..") }),
  },
};

export default nextConfig;

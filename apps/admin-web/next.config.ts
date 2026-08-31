import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? ".next" : "/tmp/admin-web-next",
  transpilePackages: ["@gomarket/ui", "@gomarket/api-client"],
  turbopack: {
    ...(process.env.VERCEL ? {} : { root: path.resolve(__dirname, "../..") }),
  },
};

export default nextConfig;

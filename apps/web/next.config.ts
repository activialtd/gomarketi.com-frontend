import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? ".next" : "/tmp/web-next",
};

export default nextConfig;

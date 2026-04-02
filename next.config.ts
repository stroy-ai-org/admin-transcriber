import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  ...(process.env.GITHUB_ACTIONS && { basePath: "/admin-transcriber" }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

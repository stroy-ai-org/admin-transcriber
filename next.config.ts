import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/admin-transcriber",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

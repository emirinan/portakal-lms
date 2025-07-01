import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "portakal-lms.fly.storage.tigris.dev",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;

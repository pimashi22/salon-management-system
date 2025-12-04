import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api_g/:path*",
        destination: `${
          process.env.BACKEND_URL || "https://glow-bridge-backend.vercel.app"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

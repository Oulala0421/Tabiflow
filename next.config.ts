import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Server Actions from LAN IPs
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.0.190:3000", "192.168.0.190:3001"],
    },
  },
  // Allow Static Resource Access (CSS/JS) from LAN
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;

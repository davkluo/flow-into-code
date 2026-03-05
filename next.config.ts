import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination:
          "https://flow-into-code.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;

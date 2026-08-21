import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{
      protocol: "https",
      hostname: "raw.githubusercontent.com",
      pathname: "/shagaofeng-rgb/cowinglasses/**",
    }],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.cowinglasses.com" }],
        destination: "https://cowinglasses.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

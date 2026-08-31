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
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'self' https://www.9-bill.com",
      "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://secure.oceanpayment.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://raw.githubusercontent.com https://www.facebook.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.facebook.com https://secure.oceanpayment.com",
      "frame-src 'self' https://www.9-bill.com https://secure.oceanpayment.com",
      "form-action 'self' https://secure.oceanpayment.com",
      "upgrade-insecure-requests",
    ].join("; ");
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "0" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      ],
    }];
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

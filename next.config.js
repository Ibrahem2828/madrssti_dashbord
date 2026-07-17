const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const apiBaseUrl = process.env.API_BASE_URL ?? (
  process.env.BACKEND_BASE_URL
    ? `${process.env.BACKEND_BASE_URL.replace(/\/$/, "")}/api/v1`
    : undefined
);

function buildRemotePatterns() {
  if (!apiBaseUrl) {
    return [];
  }

  try {
    const url = new URL(apiBaseUrl);
    const pathname = url.pathname.replace(/\/$/, "") || "/";

    return [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: `${pathname}/**`,
      },
    ];
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: buildRemotePatterns(),
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

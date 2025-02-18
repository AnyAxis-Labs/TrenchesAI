import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["openbook-v2"],
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  serverExternalPackages: ["twitter-api-v2"],
  experimental: {
    // ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;

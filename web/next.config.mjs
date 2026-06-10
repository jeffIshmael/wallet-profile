import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@langchain/core", "@langchain/google", "langchain"]
  },
  async headers() {
    return [
      {
        source: "/.well-known/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" }
        ]
      },
      {
        source: "/schemas/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stripe/crypto": false,
      "@farcaster/mini-app-solana": false,
      "@onfra": path.resolve(__dirname, "../OnFRA agent")
    };
    if (isServer) {
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js"]
      };
    }
    return config;
  }
};

export default nextConfig;

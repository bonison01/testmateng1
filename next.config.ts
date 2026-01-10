import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mdxeolqfiosscdommyhc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "uqtcgvxrcztaffzpxsql.supabase.co",
      },
    ],
  },
};

export default nextConfig;

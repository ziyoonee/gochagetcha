import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "search.pstatic.net" },
      { protocol: "https", hostname: "mblogthumb-phinf.pstatic.net" },
      { protocol: "https", hostname: "ldb-phinf.pstatic.net" },
      { protocol: "https", hostname: "gashapon.jp" },
      { protocol: "https", hostname: "bandai-a.akamaihd.net" },
      { protocol: "https", hostname: "www.takaratomy-arts.co.jp" },
    ],
  },
};

export default nextConfig;

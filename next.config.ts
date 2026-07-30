import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Pasted images are compressed client-side, but leave headroom.
      // Vercel caps request bodies at 4.5MB regardless.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;

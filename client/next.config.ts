import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true, // true = 308 permanent redirect, false = 307 temporary
      },
    ];
  },
};

export default nextConfig;

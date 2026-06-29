import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ serverExternalPackages: ["@prisma/client", "@neondatabase/serverless"],

};

export default nextConfig;

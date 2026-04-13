import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 确保使用相对路径
  basePath: "",
  assetPrefix: "",
  // 优化生产构建
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;

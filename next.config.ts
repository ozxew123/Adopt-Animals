import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "3mb" } }, // untuk upload foto hewan (maks 2 MB)
};
export default config;

import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectRoot, "..");
const usesParentWorkspace =
  fs.existsSync(path.join(workspaceRoot, "pnpm-workspace.yaml")) &&
  fs.existsSync(path.join(workspaceRoot, "node_modules", ".pnpm"));

const nextConfig: NextConfig = {
  turbopack: {
    root: usesParentWorkspace ? workspaceRoot : projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/admin/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/rent-payouts",
        destination: "/rent-submission",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

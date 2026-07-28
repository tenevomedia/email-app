import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Parent-Verzeichnis /Users/aaron hat ein eigenes package-lock.json —
// ohne festen Root wählt Turbopack den falschen Workspace und bricht
// mit "Could not find the module … in the React Client Manifest".
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;

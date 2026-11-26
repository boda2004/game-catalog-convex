import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig({
  // Supports GitHub Pages subpath deployments via BASE_PATH
  base: process.env.BASE_PATH || "/",
  define: {
    __APP_VERSION__: JSON.stringify(
      JSON.parse(
        fs.readFileSync(
          path.resolve(import.meta.dirname, "./package.json"),
          "utf-8",
        ),
      ).version,
    ),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});

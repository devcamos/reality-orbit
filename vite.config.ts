import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  server: {
    // Bind the development server to the LAN so phones and tablets on the
    // same Wi-Fi can review the responsive experience.
    host: "0.0.0.0",
    port: 4175,
    strictPort: true,
  },
});

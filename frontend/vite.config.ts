import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget = process.env.API_PROXY_TARGET || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        ws: true,
      },
      "/geo/nominatim": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geo\/nominatim/, ""),
        headers: {
          "User-Agent": "TaxiLegenda/1.0 (order-form)",
        },
      },
      "/geo/osrm": {
        target: "https://router.project-osrm.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geo\/osrm/, ""),
      },
    },
  },
});

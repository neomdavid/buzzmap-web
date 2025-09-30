import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "@svgr/rollup";
import path from "path"; // <- add this

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <- add this
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://buzzmap-backend.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  mode: process.env.NODE_ENV || "development",
  assetsInclude: ["**/*.svg"], // Ensure SVGs are included as assets
  build: {
    rollupOptions: {
      output: {
        // Use Vite default chunking to avoid React being undefined in prod
        // Ensure assets are properly handled
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/[name]-[hash].js",
        manualChunks: (id) => {
          // Create separate chunks for large dependencies
          if (id.includes("node_modules")) {
            if (id.includes("phosphor-react")) {
              return "phosphor-vendor";
            }
            if (id.includes("@reduxjs") || id.includes("redux")) {
              return "redux-vendor";
            }
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            // Keep React together to avoid dependency issues
            if (id.includes("react")) {
              return "vendor";
            }
            return "vendor";
          }
          // Create separate chunks for mapping components
          if (
            id.includes("/components/Mapping/") ||
            id.includes("/components/DengueMap")
          ) {
            return "mapping";
          }
          // Create separate chunks for admin components
          if (
            id.includes("/components/Admin/") ||
            id.includes("/pages/admin/")
          ) {
            return "admin";
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});

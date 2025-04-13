import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "@svgr/rollup";
import path from "path"; // <- add this

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <- add this
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manually defining chunks to improve chunking
        manualChunks: {
          // Example of chunking specific libraries
          react: ["react", "react-dom"],
          ui: ["@headlessui/react", "phosphor-react", "daisyui"],
          // You can add more as needed, depending on large dependencies
        },
      },
    },
  },
});

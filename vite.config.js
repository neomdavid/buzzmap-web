import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "@svgr/rollup";

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vitePluginSvgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), tailwindcss(), vitePluginSvgr()],
});

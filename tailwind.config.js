/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./**/.history/**", // Ignore .history files
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ["Koulen", "Impact", "Arial Black", "sans-serif"],
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        buzzRed: "#E64848",
      },
    },
  },
  plugins: [require("daisyui")],
};

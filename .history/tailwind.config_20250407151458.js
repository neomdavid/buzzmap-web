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
        title: ["Koulen", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        buzzRed: "#E64848",
      },
    },
  },
  plugins: [require("daisyui")],
};

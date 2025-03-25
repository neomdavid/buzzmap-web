/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["Koulen", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },

  plugins: [
    require("daisyui"),
    plugin(function ({ addBase, theme }) {
      addBase({
        "h1, h2, h3": {
          fontFamily: theme("fontFamily.title").join(", "),
        },
      });
    }),
  ],
};

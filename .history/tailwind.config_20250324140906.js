/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["Koulen", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        base: "0.5rem",
      },
    },
  },
  corePlugins: {
    // Disable OKLCH color space
    oklch: false,
  },
  plugins: [require("daisyui")],
};

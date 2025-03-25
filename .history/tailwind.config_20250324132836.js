/** @type {import('tailwindcss').Config} */
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
  corePlugins: {
    // Disable OKLCH color space
    oklch: false,
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        buzzmap: {
          primary: "#FFFFFF", // Primary (Dark Teal)
          secondary: "#FADD37", // Secondary (Yellow)
          accent: "#4AA8C7", // Accent (Surface Dark Color)
          neutral: "#DBEBF3", // Neutral (Surface Light Color)
          "base-100": "#FFFFFF", // Background white
          "base-200": "#DBEBF3", // Light background variant
          "base-300": "#6093AF", // Dark background variant
          info: "#6093AF", // You can adjust if needed
          success: "#36D399", // Success green
          warning: "#FADD37", // Use your yellow
          error: "#FF0000", // Error red
        },
      },
    ],
  },
};

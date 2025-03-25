/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#245261",
        secondary: "#FADD37",
        surfaceLight: "#DBEBF3",
        surfaceDark: "#6093AF",
        onPrimary: "#FFFFFF",
        onSecondary: "#000000",
        onSurface: "#000000",
        error: "#FF0000",
        onError: "#FFFFFF",
      },
      fontFamily: {
        title: ["Koulen", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f8",
          100: "#d7e1ef",
          200: "#b0c3df",
          300: "#88a5cf",
          400: "#5f87bf",
          500: "#3d6aa8",
          600: "#2f5386",
          700: "#243f66",
          800: "#1a2d49",
          900: "#101c2e",
        },
      },
    },
  },
  plugins: [],
};

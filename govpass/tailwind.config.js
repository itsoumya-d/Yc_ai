/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#eff6ff", 500: "#1a56db", 600: "#1649c7", 700: "#1240b0" },
      },
    },
  },
};
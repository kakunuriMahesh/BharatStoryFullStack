// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: 'class', // or 'media' or 'class'

//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     fontFamily: {
//       sans: ["sans-serif"],
//     },
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enables manual dark mode control
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#3b82f6", // Light mode color
          dark: "#2563eb",  // Dark mode color
        },
        background: {
          light: "#ffffff",
          dark: "#000",
        },
        text: {
          light: "#374151",
          dark: "#f9fafb",
        },
        NavFooter: {
          light: "#f9fafb",
          dark: "#000",
        },
      },
    },
  },
  plugins: [],
};

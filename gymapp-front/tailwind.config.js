/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#005c14', // Navbar background
          hover: '#00ff00',   // Navbar link hover
        },
        primary: {
          DEFAULT: '#2980b9', // Button primary
          hover: '#1f6391',
          light: '#eaf4ff',   // Button outline hover
        },
        danger: {
          DEFAULT: '#c0392b', // Button danger
          hover: '#992d22',
        },
        surface: {
          DEFAULT: '#f5f5f5', // SearchBar background
        },
        text: {
          main: '#1c1c1c',    // ClientPage title
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'], // Logo
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
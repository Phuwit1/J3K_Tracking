/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          gold: "#FFD700",  // สีทอง
          redCustom: "#FF4F58", // สีแดงแบบจีน
        },
      },
    },
    plugins: [],
  }
  
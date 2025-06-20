
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gradientOrange: '#FF3F00',
        gradientPurple: '#6D0C55',
        gradientRed: '#E0001E',
        backgroundBlack: '#161412',
      },
      spacing: {
        'screen': '100vh',
      },
      height: {
        '490': '30.625rem',
      },
      width: {
        '490': '30.625rem',
      },
    },
  },
  plugins: [],
}

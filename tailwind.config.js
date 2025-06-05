module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E60012',
        secondary: '#FF5722',
        dark: '#1A1A1A',
        light: '#F5F5F5',
        grayText: '#666'
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};
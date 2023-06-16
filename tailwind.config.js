/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/Popup/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E65F3',
        secondary: '#353951',
        dropdown: 'rgba(36, 38, 56, 0.7);',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        lightblue: '#242638',
        customDark: '#161920',
        screen:
          'linear-gradient(180deg, rgba(36, 38, 56, 0) 0%, #242638 143.4%);',
        error: '#b91c1c',
      },
      fill: {
        primary: '#1E65F3',
      },
      height: {
        brc: '50px',
        card: '70px',
        screen: '450px',
        cardScreen: '306px',
        activity: '450px',
        window: '600px',
        inscriptions: '420px',
        darken: '420px',
      },
      minHeight: {
        activity: '450px',
      },
      maxHeight: {
        brc20: '200px',
        inscriptions: '420px',
        activity: '450px',
      },
      width: {
        button: '40px',
        window: '360px',
        innerWindow: '340px',
      },
      fontWeight: {
        500: 500,
      },
      backgroundImage: {
        screen:
          'linear-gradient(180deg, rgba(36, 38, 56, 0) 0%, #242638 143.4%);',
        center: 'linear-gradient(345.55deg, #161A25 4.75%, #161822 100.57%);',
        mnemonic:
          'linear-gradient(180deg, rgba(36, 38, 56, 0) 0%, #242638 143.4%);',
        darken:
          'linear-gradient(0deg, rgba(22,25,32,1) 0%, rgba(253,187,45,0) 30%)',
      },
    },
  },
  plugins: [],
};

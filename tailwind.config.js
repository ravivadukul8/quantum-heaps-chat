/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slack: {
          sidebar: '#1A1D21',
          hover: '#27242C',
          active: '#1164A3',
          presence: '#2BAC76',
        },
        whatsapp: {
          teal: '#00A884',
          header: '#202C33',
          bg: '#111B21',
          panel: '#111B21',
          incoming: '#202C33',
          outgoing: '#005C4B',
          muted: '#8696A0',
          blueTick: '#53BDEB',
        },
      },
    },
  },
  plugins: [],
};

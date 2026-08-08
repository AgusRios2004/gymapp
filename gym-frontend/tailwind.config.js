/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#020617',     // slate-950 base background
          surface: '#09090b',  // zinc-950 surface
          card: '#18181b',     // zinc-900 card background
          border: '#27272a',   // zinc-800 subtle borders
          muted: '#3f3f46',    // zinc-700
          accent: '#ea580c',   // orange-600 secondary accent
          energy: '#f59e0b',   // amber-500 primary energy color
          success: '#10b981',  // emerald-500 progress/success
          metric: '#f43f5e',   // rose-500 calories/heart rate
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glow-orange': '0 0 20px -5px rgba(234, 88, 12, 0.4)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'industrial': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-energy': 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        'gradient-dark': 'linear-gradient(180deg, #09090b 0%, #020617 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(39, 39, 42, 0.4) 0%, rgba(24, 24, 27, 0.6) 100%)',
        'gradient-rose': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }
    },
  },
  plugins: [],
}
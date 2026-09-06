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
        // Tokens semánticos de GymApp — Light Mode / "Vitality Green".
        // Cambiar la marca es cambiar estos valores, no cada componente.
        gym: {
          bg: '#f8fafc',        // slate-50 — fondo de aplicación
          surface: '#ffffff',   // blanco — paneles y superficies
          card: '#ffffff',      // blanco — tarjetas
          border: '#e2e8f0',    // slate-200 — bordes por defecto
          muted: '#64748b',     // slate-500 — texto secundario
          primary: '#059669',   // emerald-600 — acento de marca (Vitality Green)
          accent: '#ea580c',    // orange-600 — acento secundario
          success: '#10b981',   // emerald-500 — progreso/éxito
          danger: '#f43f5e',    // rose-500 — grasa/calorías/error
          warning: '#f59e0b',   // amber-500 — advertencias (NO es el color de marca)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        // Sombras suaves, coherentes con fondo claro (reemplazan los "glow" de neón del tema oscuro).
        'glow-amber': '0 4px 14px -4px rgba(245, 158, 11, 0.35)',
        'glow-orange': '0 4px 14px -4px rgba(234, 88, 12, 0.35)',
        'glow-rose': '0 4px 14px -4px rgba(244, 63, 94, 0.35)',
        'glow-emerald': '0 4px 14px -4px rgba(16, 185, 129, 0.35)',
        'industrial': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
      },
      backgroundImage: {
        'gradient-energy': 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(248, 250, 252, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
        'gradient-rose': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }
    },
  },
  plugins: [],
}

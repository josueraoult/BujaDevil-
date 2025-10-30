/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Palette de couleurs moderne bleu/cyan
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          news: '#ef4444',
          gaming: '#8b5cf6',
          apps: '#06b6d4',
          tutorials: '#10b981',
        },
        dark: {
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
        }
      },
      
      // Typographie moderne
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      // Animations personnalisées
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      
      // Effets de glassmorphism
      backdropBlur: {
        xs: '2px',
      },
      
      // Gradients modernes
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-border': 'linear-gradient(90deg, #0ea5e9, #8b5cf6, #06b6d4)',
        'hero-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #06b6d4 100%)',
      },
      
      // Responsive design amélioré
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      
      // Typographie responsive
      fontSize: {
        'dynamic-lg': 'clamp(2rem, 5vw, 3.5rem)',
        'dynamic': 'clamp(1.5rem, 4vw, 2.5rem)',
      }
    },
  },
  plugins: [
    // Plugin pour les styles de sélection de texte
    function({ addUtilities }) {
      addUtilities({
        '.selection-primary': {
          '&::selection': {
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
          }
        }
      })
    }
  ],
      }

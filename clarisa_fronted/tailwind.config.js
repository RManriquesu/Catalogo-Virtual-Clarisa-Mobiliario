/** @type {import('tailwindcss').Config} */

// Configuración del tema Tailwind de Clarisa Mobiliario.
// Define el sistema de diseño: paleta de colores (Material), radios,
// espaciado, tipografías (EB Garamond + Plus Jakarta Sans) y sombras.
export default {
  // Archivos donde Tailwind escaneará las clases usadas.
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ===== Paleta de colores del tema (esquema "madera/neutro") =====
      colors: {
        'primary-fixed': '#ede0dc',
        'secondary-fixed-dim': '#ffb59b',
        'inverse-surface': '#31312d',
        'tertiary-fixed': '#ffdcc1',
        'error-container': '#ffdad6',
        'on-background': '#1c1c18',
        'on-secondary-container': '#762c0d',
        'tertiary-container': '#38220d',
        'surface-container-low': '#f6f3ed',
        'on-error': '#ffffff',
        primary: '#16110f', // Color principal (casi negro/madera oscura)
        'secondary-container': '#ff956e',
        'primary-fixed-dim': '#d0c4c0',
        'on-tertiary': '#ffffff',
        'surface-dim': '#dcdad4',
        'inverse-on-surface': '#f3f0ea',
        'on-primary-container': '#968b88',
        'on-tertiary-container': '#a9876c',
        'on-primary-fixed': '#211a18',
        'surface-container-lowest': '#ffffff',
        'on-tertiary-fixed-variant': '#5c412a',
        'surface-container': '#f0eee8',
        'inverse-primary': '#d0c4c0',
        'surface-container-highest': '#e5e2dc',
        outline: '#807572',
        surface: '#fcf9f3',
        background: '#fcf9f3',
        'surface-tint': '#665c5a',
        secondary: '#994626', // Acento terracota/óxido
        'on-surface-variant': '#4e4542',
        'on-primary': '#ffffff',
        'on-error-container': '#93000a',
        'surface-container-high': '#ebe8e2',
        'on-primary-fixed-variant': '#4d4543',
        'on-secondary-fixed': '#380d00',
        'on-surface': '#1c1c18',
        'tertiary-fixed-dim': '#e5bfa1',
        'surface-bright': '#fcf9f3',
        'outline-variant': '#d1c4c0',
        'on-tertiary-fixed': '#2b1704',
        'surface-variant': '#e5e2dc',
        error: '#ba1a1a',
        'on-secondary': '#ffffff',
        'secondary-fixed': '#ffdbcf',
        'on-secondary-fixed-variant': '#7a2f10',
        'primary-container': '#2c2523',
        tertiary: '#1f0d00',
      },
      // ===== Radios de borde =====
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      // ===== Espaciado interno (gulías de layout) =====
      spacing: {
        margin: '4rem',
        'margin-mobile': '1.25rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.75rem',
        'space-xl': '3rem',
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
      },
      // ===== Familias tipográficas por estilo =====
      fontFamily: {
        'headline-xl': ['"EB Garamond"', 'serif'],
        'headline-lg': ['"EB Garamond"', 'serif'],
        'headline-md': ['"EB Garamond"', 'serif'],
        'headline-sm': ['"EB Garamond"', 'serif'],
        'body-lg': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-sm': ['"Plus Jakarta Sans"', 'sans-serif'],
        'price-lg': ['"Plus Jakarta Sans"', 'sans-serif'],
        'price-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-md': ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-sm': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      // ===== Tamaños de fuente con su interlineado/espaciado =====
      fontSize: {
        'headline-xl': ['56px', { lineHeight: '64px', letterSpacing: '-0.02em' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em' }],
        'headline-md': ['28px', { lineHeight: '36px' }],
        'headline-sm': ['22px', { lineHeight: '28px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['15px', { lineHeight: '24px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        'price-lg': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'price-md': ['17px', { lineHeight: '24px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '600' }],
        'label-sm': ['10px', { lineHeight: '14px', letterSpacing: '0.1em', fontWeight: '700' }],
      },
      // ===== Sombras personalizadas =====
      boxShadow: {
        // Sombra suave tipo "madera" para tarjetas.
        wood: '0 16px 36px -8px rgba(44,37,35,0.08), 0 4px 12px -2px rgba(44,37,35,0.04)',
        soft: '0 1px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
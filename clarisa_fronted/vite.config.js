// Configuración de Vite: bundler / dev server del frontend.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Plugin oficial de React (Fast Refresh) para compilar JSX y HMR.
  plugins: [react()],
})
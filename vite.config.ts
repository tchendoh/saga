import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from chummey.com/saga/
  base: '/saga/',
  plugins: [react()],
})

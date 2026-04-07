import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Set VITE_BASE_PATH=/Kriyashakti-AI/ in GitHub Actions for production builds
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH ?? '/',
})

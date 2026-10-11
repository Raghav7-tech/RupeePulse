import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/RupeePulse/',
  plugins: [react()],
  build: { target: 'es2022', cssMinify: true, sourcemap: false },
})

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: { port: 4180, proxy: {
    '/api': { target: 'http://127.0.0.1:3001', rewrite: (p) => p.replace(/^\/api/, ''), cookiePathRewrite: { '/auth': '/api/auth' } },
    '/fotos': { target: 'http://127.0.0.1:59000', rewrite: (p) => p.replace(/^\/fotos/, '') } } },
})

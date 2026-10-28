import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // dev: mesmo caminho que o nginx usa em produção
  server: {
    proxy: {
      // o refresh token vive em /auth; o nginx de produção reescreve o caminho do cookie, aqui também
      '/api': {
        target: 'http://localhost:3001',
        rewrite: (p) => p.replace(/^\/api/, ''),
        cookiePathRewrite: { '/auth': '/api/auth' },
      },
      '/fotos': { target: 'http://localhost:9000', rewrite: (p) => p.replace(/^\/fotos/, '') },
    },
  },
})

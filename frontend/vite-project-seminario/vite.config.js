import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige todas las peticiones que comienzan con /api al backend
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''), // si en backend no usan /api en la ruta
      }
    },
  },
})

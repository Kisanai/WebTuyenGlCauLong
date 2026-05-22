import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Cho phep Cloudflare Tunnel (Vite 6+ mac dinh chan host la)
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/auth': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/posts': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/bookings': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/notifications': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/users': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      // Chi API admin — KHONG proxy /admin, /admin/login (trang React)
      '^/admin/(users|posts|stats)': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
  preview: {
    host: true,
    port: 5173,
  },
})

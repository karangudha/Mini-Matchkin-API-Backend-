import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    server: {
        port: process.env.PORT || 5173,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL,
                changeOrigin: true
            }
        },
        allowedHosts: ['mini-matchkin-api-backend-2.onrender.com']
    },
    preview: {
        port: process.env.PORT || 4173,
        host: '0.0.0.0'
    }
}) 
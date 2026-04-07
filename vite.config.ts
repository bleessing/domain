import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    cors: {
      origin: process.env.VITE_CORS_ORIGIN || '*',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Plotly в отдельном чанке — загружается только при первом показе чарта
          'vendor-plotly': ['plotly.js', 'react-plotly.js'],
          // React-экосистема — стабильный кешируемый чанк
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // Ant Design — большая библиотека, отдельный кешируемый чанк
          'vendor-antd': ['antd'],
        },
      },
    },
  },
})

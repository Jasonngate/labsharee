import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ alias for @
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/static'), // ✅ Correct relative path
    emptyOutDir: true, // Clear folder before build
  },
})

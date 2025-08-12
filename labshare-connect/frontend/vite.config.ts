import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../labshare-connect/backend/static'), // Direct output to backend/static
    emptyOutDir: true, // Clear folder before build
  },
})

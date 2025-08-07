import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/', // Make sure this is set correctly
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 👈 This is the key fix
    },
  },
})

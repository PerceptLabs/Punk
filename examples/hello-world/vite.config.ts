import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@punk/core': '../../packages/core/src',
      '@punk/components': '../../packages/components/src'
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.zip'],
  publicDir: 'pictoclone-assets',
  plugins: [vue()],
  build: {
    target: 'es2020'
  }
})

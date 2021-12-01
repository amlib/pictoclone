import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.zip'],
  publicDir: 'pictoclone-assets',
  //base: '/pictoclone/', // uncomment when deploying to a gh pages with a sub directory
  plugins: [vue()],
  build: {
    target: 'es2020'
  }
})

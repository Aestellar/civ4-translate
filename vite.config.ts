import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/civ4-translator/', // Replace <repo-name> with your GitHub repository name
  plugins: [react()],
})

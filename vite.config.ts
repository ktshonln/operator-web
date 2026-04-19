import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // This string is captured once during 'npm run build'
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})

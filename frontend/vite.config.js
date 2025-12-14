import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const URL = JSON.stringify("https://api.secretsanta.michaelyackerman.com/api")

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_BACKEND_BASE_URL': JSON.stringify('http://localhost:3000/api')
  },
})

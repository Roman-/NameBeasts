import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

function resolveBasePath() {
  const rawBase = process.env.VITE_APP_BASE_PATH || './'
  if (rawBase === './' || rawBase === '.' || rawBase === '') {
    return './'
  }

  return rawBase.endsWith('/') ? rawBase : `${rawBase}/`
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react(), tailwind()],
  // Only keep these if you actually need react-pdf:
  optimizeDeps: {
    include: ['react-pdf'],
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /node_modules/],
    },
  },
})

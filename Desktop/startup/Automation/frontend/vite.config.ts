import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // ensure single React copy by resolving to project node_modules
      // Point directly to the package entry files to avoid bundling hoisted/other copies
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // don't force-alias router packages (their entry paths vary); keep only React aliases
    },
  },
  plugins: [
    react(),
    tailwindcss(),

  ],
})

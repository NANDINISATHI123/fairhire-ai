import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env variables from .env files
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript error where `cwd`
  // was not found on the `process` object type. In Vite's `loadEnv` function, `'.'`
  // correctly resolves to the project root directory.
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      // Expose them on process.env
      'process.env': env
    },
    plugins: [react()],
  }
})
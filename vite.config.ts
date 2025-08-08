import { webcrypto } from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Polyfill for globalThis.crypto if missing
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.cjs', // Ensure Tailwind is loaded
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
});

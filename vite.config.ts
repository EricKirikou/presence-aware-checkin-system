import { webcrypto } from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Safe assignment: only if not already defined
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

export default {
  darkMode: "class", // ✅ Correct placement
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

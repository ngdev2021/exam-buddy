import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000"
    }
  },
  resolve: {
    alias: {
      'framer-motion': resolve(__dirname, 'node_modules/framer-motion')
    }
  },
  optimizeDeps: {
    include: ['framer-motion']
  },
  build: {
    commonjsOptions: {
      include: [/framer-motion/, /node_modules/]
    }
  }
});

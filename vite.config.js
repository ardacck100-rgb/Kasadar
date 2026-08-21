import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Göreli yollar: dist/ klasörü kök dizinde de, alt klasörde de (GitHub Pages
  // gibi) hiçbir ayar değiştirmeden çalışsın.
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    open: true,
  },
});

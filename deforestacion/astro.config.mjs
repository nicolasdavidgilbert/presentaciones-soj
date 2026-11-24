import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  build: {
    // CSS dentro del HTML (no en ficheros aparte con rutas absolutas)
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Fuentes y script se incrustan en el HTML: así index.html
      // funciona abriéndolo con doble clic (file://), sin servidor.
      assetsInlineLimit: 100_000_000,
    },
  },
});

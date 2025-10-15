import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
    import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [
        VitePWA({
          // PWA configuration options go here
          registerType: 'autoUpdate', // or 'prompt', 'injectManifest'
          manifest: {
            name: 'Tada',
            short_name: 'Tada',
            description: 'Tasks and Notes rightaway',
            theme_color: '#ffffff',
            icons: [
              {
                src: '/icons/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/icons/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: '/icons/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
          // Other PWA options like workbox, devOptions, etc.
        }),
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

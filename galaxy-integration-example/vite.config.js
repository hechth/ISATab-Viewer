import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'main.js'),
      name: 'ISATabViewerGalaxy',
      fileName: 'index'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'main.css';
          }
          return assetInfo.name;
        }
      }
    }
  },
  server: {
    open: true,
    port: 3000
  }
});

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    electron([
      { entry: 'electron/main.ts', vite: { build: { outDir: 'dist-electron' } } },
      { entry: 'electron/preload.ts', vite: { build: { outDir: 'dist-electron' } } },
    ]),
    renderer(),
  ],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
});

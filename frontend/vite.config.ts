import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
  envDir: '../',
  plugins: [react(), svgrPlugin(), pluginRewriteAll()],
  resolve: {
    alias: [{ find: '~', replacement: resolve(__dirname, 'src') }],
  },
  build: {
    outDir: './dist',
    cssCodeSplit: false,
  },
});

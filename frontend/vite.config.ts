import react from '@vitejs/plugin-react';
import { resolve } from 'app-root-path';
import { defineConfig } from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgrPlugin from 'vite-plugin-svgr';

import { localhostPort } from '../common/consts';

export default defineConfig({
  plugins: [react(), svgrPlugin(), pluginRewriteAll()],
  resolve: {
    alias: [{ find: '~', replacement: resolve('frontend/src') }],
  },
  build: {
    outDir: './dist',
    cssCodeSplit: false,
    target: 'esnext',
  },
  server: {
    port: localhostPort,
  },
  envDir: '../',
});

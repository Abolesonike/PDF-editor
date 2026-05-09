import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    optimizeDeps: { include: ['pdfjs-dist'] },
    worker: { format: 'es' },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: function (assetInfo) {
                    var name = assetInfo.name || '';
                    if (/\.mjs$/.test(name)) {
                        return 'assets/[name]-[hash].js';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});

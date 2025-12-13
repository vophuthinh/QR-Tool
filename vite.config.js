import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3111,
        host: true,
    },
    preview: {
        port: 3111,
        host: true,
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.js'],
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '*.config.js',
                'dist/',
            ],
        },
    },
});

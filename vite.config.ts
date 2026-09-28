import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // 必须与 tsconfig 的 baseUrl + paths 对应
        },
    },
})
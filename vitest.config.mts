import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.ts'],
    },
    env: {
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      utils: path.resolve(__dirname, 'src/utils'),
      entities: path.resolve(__dirname, 'src/entities'),
      modules: path.resolve(__dirname, 'src/modules'),
      middlewares: path.resolve(__dirname, 'src/middlewares'),
      jobs: path.resolve(__dirname, 'src/jobs'),
    },
  },
});

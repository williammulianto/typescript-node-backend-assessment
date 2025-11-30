import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { initTestApp } from 'utils/test-helper.js';

let app: Express;

describe('API Endpoints', () => {
  beforeAll(async () => {
    app = await initTestApp();
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});

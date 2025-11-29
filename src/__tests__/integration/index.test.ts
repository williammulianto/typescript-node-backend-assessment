import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index';

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return Hello world!', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});

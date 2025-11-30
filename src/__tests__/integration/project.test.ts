import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { initTestApp } from 'utils/test-helper.js';
import { Database } from 'utils/db';

let app: Express;
let db: Database;

describe('Project API Integration Tests', () => {
  beforeAll(async () => {
    const testApp = await initTestApp();
    app = testApp.app;
    db = testApp.db;
  });

  beforeEach(async () => {
    // On Each test it init a new app, so 1 test is 1 workflow
    await db.orm.getSchemaGenerator().refreshDatabase();
  });

  describe('CRUD Projects', () => {
    it('should reject faulty dates', async () => {
      const newProject = {
        name: 'Workflow Test Project',
        description: 'Testing complete workflow',
        isArchived: false,
        startDate: 'Invalid dates',
        endDate: '2024-09-30',
      };

      const createResponse = await request(app).post('/projects').send(newProject);
      expect(createResponse.status).toBe(400);
    });

    it('should reject endDate greater than startDate', async () => {
      const newProject = {
        name: 'Workflow Test Project',
        description: 'Testing complete workflow',
        isArchived: false,
        startDate: '2025-09-30',
        endDate: '2024-09-30',
      };

      const createResponse = await request(app).post('/projects').send(newProject);
      expect(createResponse.status).toBe(400);
    });

    it('should create a project and then retrieve it', async () => {
      let getAllResponse = await request(app).get('/projects');
      expect(getAllResponse.body).toEqual([]);

      const newProject = {
        name: 'Workflow Test Project',
        description: 'Testing complete workflow',
        isArchived: false,
        startDate: '2024-03-01',
        endDate: '2024-09-30',
      };

      const createResponse = await request(app).post('/projects').send(newProject);
      expect(createResponse.status).toBe(201);

      const projectId = createResponse.body.id;

      const getByIdResponse = await request(app).get(`/projects/${projectId}`);
      expect(getByIdResponse.status).toBe(200);
      expect(getByIdResponse.body.id).toBe(projectId);

      getAllResponse = await request(app).get('/projects');
      expect(getAllResponse.status).toBe(200);

      const foundProject = getAllResponse.body.find((p: any) => p.id === projectId);
      expect(foundProject).toBeDefined();
      expect(foundProject.name).toBe('Workflow Test Project');
    });
  });
});

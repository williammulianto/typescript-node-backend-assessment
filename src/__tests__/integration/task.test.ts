import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { initTestApp } from 'utils/test-helper.js';
import { Database } from 'utils/db';
import { TaskStatus } from 'entities/Task';

let app: Express;
let db: Database;

describe('Task API Integration Tests', () => {
  beforeAll(async () => {
    const testApp = await initTestApp();
    app = testApp.app;
    db = testApp.db;
  });

  beforeEach(async () => {
    await db.orm.getSchemaGenerator().refreshDatabase();
  });

  describe('CRUD Tasks', () => {
    it('should create a task and retrieve it', async () => {
      const newProject = {
        name: 'Test Project',
        description: 'Project for testing tasks',
        isArchived: false,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const projectResponse = await request(app).post('/projects').send(newProject);
      expect(projectResponse.status).toBe(201);
      const projectId = projectResponse.body.id;

      const newTask = {
        name: 'Test Task',
        description: 'Task description',
        status: TaskStatus.PENDING,
        dueDate: '2024-06-30',
        projectId: projectId,
      };

      const createResponse = await request(app).post('/tasks').send(newTask);
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.name).toBe('Test Task');
      expect(createResponse.body.projectId).toBe(projectId);

      const taskId = createResponse.body.id;

      const getByIdResponse = await request(app).get(`/tasks/${taskId}`);
      expect(getByIdResponse.status).toBe(200);
      expect(getByIdResponse.body.id).toBe(taskId);
      expect(getByIdResponse.body.name).toBe('Test Task');

      const getByProjectResponse = await request(app).get(`/tasks/project/${projectId}`);
      expect(getByProjectResponse.status).toBe(200);
      expect(getByProjectResponse.body.length).toBe(1);
      expect(getByProjectResponse.body[0].id).toBe(taskId);

      const updatePayload = {
        name: 'Updated Task',
        description: 'Updated description',
        status: TaskStatus.COMPLETED,
      };

      const updateResponse = await request(app).post(`/tasks/${taskId}`).send(updatePayload);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Task');
      expect(updateResponse.body.status).toBe(TaskStatus.COMPLETED);

      const deleteResponse = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteResponse.status).toBe(200);

      const getAfterDelete = await request(app).get(`/tasks/${taskId}`);
      expect(getAfterDelete.status).toBe(404);
    });

    it('should reject task with invalid project', async () => {
      const newTask = {
        name: 'Test Task',
        description: 'Task description',
        status: TaskStatus.PENDING,
        dueDate: '2024-06-30',
        projectId: 'a4353c80-0668-4afd-ae1d-d85cb7713e6d',
      };

      const createResponse = await request(app).post('/tasks').send(newTask);
      expect(createResponse.status).toBe(404);
    });

    it('should reject task with invalid due date', async () => {
      const newProject = {
        name: 'Test Project',
        description: 'Project for testing tasks',
        isArchived: false,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const projectResponse = await request(app).post('/projects').send(newProject);
      const projectId = projectResponse.body.id;

      const newTask = {
        name: 'Test Task',
        description: 'Task description',
        status: TaskStatus.PENDING,
        dueDate: 'invalid-date',
        projectId: projectId,
      };

      const createResponse = await request(app).post('/tasks').send(newTask);
      expect(createResponse.status).toBe(400);
    });
  });
});

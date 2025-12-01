import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from 'modules/tasks/task.service';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { Task, TaskStatus } from 'entities/Task';
import { Project } from 'entities/Project';
import { CreateTaskDto } from 'modules/tasks/dto/CreateTaskDto';
import { UpdateTaskDto } from 'modules/tasks/dto/UpdateTaskDto';
import { NotFoundError, ValidationError } from 'utils/errors';
import { TASK_ERROR_CODE } from 'modules/tasks/errors/task.error_code';

describe('TaskService Unit Tests', () => {
  let taskService: TaskService;
  let mockTaskRepo: EntityRepository<Task>;
  let mockProjectRepo: EntityRepository<Project>;
  let mockEntityManager: EntityManager;

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Project Description',
    isArchived: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as Project;

  beforeEach(() => {
    mockTaskRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
    } as unknown as EntityRepository<Task>;

    mockProjectRepo = {
      findOne: vi.fn(),
    } as unknown as EntityRepository<Project>;

    mockEntityManager = {
      persistAndFlush: vi.fn(),
      flush: vi.fn(),
    } as unknown as EntityManager;

    taskService = new TaskService(mockTaskRepo, mockProjectRepo, mockEntityManager);
  });

  describe('getTaskById', () => {
    it('should return a task DTO when task exists', async () => {
      const mockTask: Task = {
        id: 'task-1',
        name: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(mockTask);

      const result = await taskService.getTaskById('task-1');

      expect(result).toEqual({
        id: 'task-1',
        name: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        dueDate: mockTask.dueDate,
        projectId: 'project-1',
        createdAt: mockTask.createdAt,
        updatedAt: mockTask.updatedAt,
      });
    });

    it('should throw NotFoundError when task does not exist', async () => {
      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(null);

      await expect(taskService.getTaskById('non-existent-id')).rejects.toThrow(NotFoundError);
      await expect(taskService.getTaskById('non-existent-id')).rejects.toThrow('Task not found.');
    });
  });

  describe('getTasksByProjectId', () => {
    it('should return an array of task DTOs for a valid project', async () => {
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          name: 'Test Task 1',
          description: 'Description 1',
          status: TaskStatus.PENDING,
          dueDate: new Date('2024-12-31'),
          project: mockProject,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        } as Task,
        {
          id: 'task-2',
          name: 'Test Task 2',
          description: 'Description 2',
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date('2024-11-30'),
          project: mockProject,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        } as Task,
      ];

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);
      vi.mocked(mockTaskRepo.find).mockResolvedValue(mockTasks);

      const result = await taskService.getTasksByProjectId('project-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task-1');
      expect(result[1].id).toBe('task-2');
    });

    it('should return an empty array when project has no tasks', async () => {
      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);
      vi.mocked(mockTaskRepo.find).mockResolvedValue([]);

      const result = await taskService.getTasksByProjectId('project-1');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);

      await expect(taskService.getTasksByProjectId('non-existent-id')).rejects.toThrow(
        NotFoundError
      );
      await expect(taskService.getTasksByProjectId('non-existent-id')).rejects.toThrow(
        'Project not found.'
      );
    });
  });

  describe('addTask', () => {
    it('should create and return a new task when data is valid', async () => {
      const createDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Task Description',
        status: TaskStatus.PENDING,
        dueDate: '2024-12-31',
        projectId: 'project-1',
      };

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      const result = await taskService.addTask(createDto);

      expect(result).toHaveProperty('name', 'New Task');
      expect(result).toHaveProperty('description', 'New Task Description');
      expect(result).toHaveProperty('status', TaskStatus.PENDING);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      const createDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Task Description',
        status: TaskStatus.PENDING,
        dueDate: '2024-12-31',
        projectId: 'non-existent-id',
      };

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);

      await expect(taskService.addTask(createDto)).rejects.toThrow(NotFoundError);
      await expect(taskService.addTask(createDto)).rejects.toThrow('Project not found.');
    });

    it('should throw ValidationError when due date is invalid', async () => {
      const createDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Task Description',
        status: TaskStatus.PENDING,
        dueDate: 'invalid-date',
        projectId: 'project-1',
      };

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);

      await expect(taskService.addTask(createDto)).rejects.toThrow(ValidationError);
      await expect(taskService.addTask(createDto)).rejects.toThrow('Invalid due date format.');
    });

    it('should include correct error code when project not found', async () => {
      const createDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Task Description',
        status: TaskStatus.PENDING,
        dueDate: '2024-12-31',
        projectId: 'non-existent-id',
      };

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);

      try {
        await taskService.addTask(createDto);
        expect.fail('Should have thrown NotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).errorCode).toBe(TASK_ERROR_CODE.PROJECT_NOT_FOUND);
      }
    });

    it('should include correct error code when due date is invalid', async () => {
      const createDto: CreateTaskDto = {
        name: 'New Task',
        description: 'New Task Description',
        status: TaskStatus.PENDING,
        dueDate: 'invalid-date',
        projectId: 'project-1',
      };

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);

      try {
        await taskService.addTask(createDto);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).errorCode).toBe(TASK_ERROR_CODE.INVALID_DUE_DATE);
      }
    });
  });

  describe('updateTask', () => {
    it('should successfully update a task with valid data', async () => {
      const updateDto: UpdateTaskDto = {
        name: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.COMPLETED,
        dueDate: '2024-11-30',
      };

      const existingTask: Task = {
        id: 'task-1',
        name: 'Old Task',
        description: 'Old Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(existingTask);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      const result = await taskService.updateTask(updateDto, 'task-1');

      expect(result).toHaveProperty('name', 'Updated Task');
      expect(result).toHaveProperty('description', 'Updated Description');
      expect(result).toHaveProperty('status', TaskStatus.COMPLETED);
      expect(result.dueDate).toEqual(new Date('2024-11-30'));
    });

    it('should update project when projectId is provided', async () => {
      const newProject: Project = {
        id: 'project-2',
        name: 'New Project',
        description: 'New Project Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Project;

      const updateDto: UpdateTaskDto = {
        name: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        projectId: 'project-2',
      };

      const existingTask: Task = {
        id: 'task-1',
        name: 'Old Task',
        description: 'Old Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(existingTask);
      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(newProject);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      const result = await taskService.updateTask(updateDto, 'task-1');

      expect(result.projectId).toBe('project-2');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      const updateDto: UpdateTaskDto = {
        name: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.COMPLETED,
      };

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(null);

      await expect(taskService.updateTask(updateDto, 'non-existent-id')).rejects.toThrow(
        NotFoundError
      );
      await expect(taskService.updateTask(updateDto, 'non-existent-id')).rejects.toThrow(
        'Task not found.'
      );
    });

    it('should throw NotFoundError when new project does not exist', async () => {
      const updateDto: UpdateTaskDto = {
        name: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        projectId: 'non-existent-project',
      };

      const existingTask: Task = {
        id: 'task-1',
        name: 'Old Task',
        description: 'Old Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(existingTask);
      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);

      await expect(taskService.updateTask(updateDto, 'task-1')).rejects.toThrow(NotFoundError);
      await expect(taskService.updateTask(updateDto, 'task-1')).rejects.toThrow(
        'Project not found.'
      );
    });

    it('should throw ValidationError when due date is invalid', async () => {
      const updateDto: UpdateTaskDto = {
        name: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        dueDate: 'invalid-date',
      };

      const existingTask: Task = {
        id: 'task-1',
        name: 'Old Task',
        description: 'Old Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(existingTask);

      await expect(taskService.updateTask(updateDto, 'task-1')).rejects.toThrow(ValidationError);
      await expect(taskService.updateTask(updateDto, 'task-1')).rejects.toThrow(
        'Invalid due date format.'
      );
    });
  });

  describe('deleteTask', () => {
    it('should successfully soft delete a task', async () => {
      const mockTask: Task = {
        id: 'task-1',
        name: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(mockTask);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      const result = await taskService.deleteTask('task-1');

      expect(mockTask.deletedAt).toBeInstanceOf(Date);
      expect(result).toHaveProperty('name', 'Test Task');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(null);

      await expect(taskService.deleteTask('non-existent-id')).rejects.toThrow(NotFoundError);
      await expect(taskService.deleteTask('non-existent-id')).rejects.toThrow('Task not found.');
    });

    it('should set deletedAt timestamp correctly', async () => {
      const mockTask: Task = {
        id: 'task-1',
        name: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      } as Task;

      vi.mocked(mockTaskRepo.findOne).mockResolvedValue(mockTask);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      await taskService.deleteTask('task-1');

      expect(mockTask.deletedAt).toBeInstanceOf(Date);
      expect(mockTask.deletedAt?.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });

  describe('findOverdueTasks', () => {
    it('should return tasks that are overdue', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000); // 1 day ago

      const mockOverdueTasks: Task[] = [
        {
          id: 'task-1',
          name: 'Overdue Task 1',
          description: 'Description 1',
          status: TaskStatus.PENDING,
          dueDate: pastDate,
          project: mockProject,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        } as Task,
        {
          id: 'task-2',
          name: 'Overdue Task 2',
          description: 'Description 2',
          status: TaskStatus.IN_PROGRESS,
          dueDate: pastDate,
          project: mockProject,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        } as Task,
      ];

      vi.mocked(mockTaskRepo.find).mockResolvedValue(mockOverdueTasks);

      const result = await taskService.findOverdueTasks();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task-1');
      expect(result[1].id).toBe('task-2');
    });

    it('should return empty array when no overdue tasks exist', async () => {
      vi.mocked(mockTaskRepo.find).mockResolvedValue([]);

      const result = await taskService.findOverdueTasks();

      expect(result).toEqual([]);
    });

    it('should exclude completed, cancelled, and overdue tasks', async () => {
      vi.mocked(mockTaskRepo.find).mockResolvedValue([]);

      await taskService.findOverdueTasks();

    });
  });

  describe('markTasksAsOverdue', () => {
    it('should mark tasks as overdue and return count', async () => {
      const taskIds = ['task-1', 'task-2', 'task-3'];
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.PENDING,
          dueDate: new Date('2024-01-01'),
          project: mockProject,
        } as Task,
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date('2024-01-01'),
          project: mockProject,
        } as Task,
        {
          id: 'task-3',
          name: 'Task 3',
          description: 'Description 3',
          status: TaskStatus.PENDING,
          dueDate: new Date('2024-01-01'),
          project: mockProject,
        } as Task,
      ];

      vi.mocked(mockTaskRepo.find).mockResolvedValue(mockTasks);
      vi.mocked(mockEntityManager.flush).mockResolvedValue(undefined);

      const result = await taskService.markTasksAsOverdue(taskIds);

      expect(result).toBe(3);
      mockTasks.forEach((task) => {
        expect(task.status).toBe(TaskStatus.OVERDUE);
      });
    });

    it('should return 0 when no tasks are found', async () => {
      const taskIds = ['non-existent-1', 'non-existent-2'];
      vi.mocked(mockTaskRepo.find).mockResolvedValue([]);
      vi.mocked(mockEntityManager.flush).mockResolvedValue(undefined);

      const result = await taskService.markTasksAsOverdue(taskIds);

      expect(result).toBe(0);
    });

    it('should return 0 when empty array is provided', async () => {
      vi.mocked(mockTaskRepo.find).mockResolvedValue([]);
      vi.mocked(mockEntityManager.flush).mockResolvedValue(undefined);

      const result = await taskService.markTasksAsOverdue([]);

      expect(result).toBe(0);
    });
  });

  describe('mapToDto', () => {
    it('should correctly map entity to DTO', () => {
      const entity: Task = {
        id: 'task-id',
        name: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-12-31'),
        project: mockProject,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-06-01T15:30:00Z'),
      } as Task;

      const result = taskService.mapToDto(entity);

      expect(result).toEqual({
        id: 'task-id',
        name: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-12-31'),
        projectId: 'project-1',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-06-01T15:30:00Z'),
      });
    });

    it('should map all task statuses correctly', () => {
      // Test each status
      const statuses = [
        TaskStatus.PENDING,
        TaskStatus.IN_PROGRESS,
        TaskStatus.COMPLETED,
        TaskStatus.OVERDUE,
        TaskStatus.CANCELLED,
      ];

      statuses.forEach((status) => {
        const entity: Task = {
          id: 'task-id',
          name: 'Test Task',
          description: 'Test Description',
          status: status,
          dueDate: new Date('2024-12-31'),
          project: mockProject,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        } as Task;

        const result = taskService.mapToDto(entity);
        expect(result.status).toBe(status);
      });
    });
  });
});

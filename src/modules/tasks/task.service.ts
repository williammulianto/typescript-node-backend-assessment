import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { CreateTaskDto } from './dto/CreateTaskDto';
import { TaskDto } from './dto/TaskDto';
import { NotFoundError, ValidationError } from 'utils/errors';
import { TASK_ERROR_CODE } from './errors/task.error_code';
import { Task, TaskStatus } from 'entities/Task';
import { UpdateTaskDto } from './dto/UpdateTaskDto';
import { Project } from 'entities/Project';

export class TaskService {
  constructor(
    private taskRepo: EntityRepository<Task>,
    private projectRepo: EntityRepository<Project>,
    private em: EntityManager
  ) {}

  async getTaskById(id: string) {
    const task = await this.taskRepo.findOne(
      { id: id, deletedAt: null },
      { populate: ['project'] }
    );
    if (!task) {
      throw new NotFoundError('Task not found.');
    }
    const taskDto = this.mapToDto(task);
    return taskDto;
  }

  async getTasksByProjectId(projectId: string) {
    const project = await this.projectRepo.findOne({ id: projectId, deletedAt: null });
    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    const tasks = await this.taskRepo.find(
      {
        project: projectId,
        deletedAt: null,
      },
      { populate: ['project'] }
    );
    return tasks.map((t) => this.mapToDto(t));
  }

  async addTask(data: CreateTaskDto) {
    const project = await this.projectRepo.findOne({
      id: data.projectId,
      deletedAt: null,
    });
    if (!project) {
      throw new NotFoundError('Project not found.', TASK_ERROR_CODE.PROJECT_NOT_FOUND);
    }

    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new ValidationError('Invalid due date format.', TASK_ERROR_CODE.INVALID_DUE_DATE);
    }

    const entity = new Task();
    entity.name = data.name;
    entity.description = data.description;
    entity.status = data.status;
    entity.dueDate = dueDate;
    entity.project = project;
    await this.em.persistAndFlush(entity);
    return this.mapToDto(entity);
  }

  async updateTask(data: UpdateTaskDto, id: string) {
    const entity = await this.taskRepo.findOne({
      id: id,
      deletedAt: null,
    });

    if (!entity) {
      throw new NotFoundError('Task not found.');
    }

    if (data.projectId) {
      const project = await this.projectRepo.findOne({
        id: data.projectId,
        deletedAt: null,
      });
      if (!project) {
        throw new NotFoundError('Project not found.', TASK_ERROR_CODE.PROJECT_NOT_FOUND);
      }
      entity.project = project;
    }

    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Invalid due date format.', TASK_ERROR_CODE.INVALID_DUE_DATE);
      }
      entity.dueDate = dueDate;
    }

    entity.name = data.name;
    entity.description = data.description;
    entity.status = data.status;

    await this.em.persistAndFlush(entity);
    return this.mapToDto(entity);
  }

  async deleteTask(id: string) {
    const task = await this.taskRepo.findOne({
      id: id,
    });

    if (!task) {
      throw new NotFoundError('Task not found.');
    }
    task.deletedAt = new Date();
    await this.em.persistAndFlush(task);
    return this.mapToDto(task);
  }

  async findOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    const tasks = await this.taskRepo.find(
      {
        dueDate: { $lt: now },
        status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.OVERDUE] },
        deletedAt: null,
      },
      { populate: ['project'] }
    );
    return tasks;
  }

  async markTasksAsOverdue(taskIds: string[]): Promise<number> {
    const tasks = await this.taskRepo.find({ id: { $in: taskIds } });
    tasks.forEach((task) => {
      task.status = TaskStatus.OVERDUE;
    });
    await this.em.flush();
    return tasks.length;
  }

  mapToDto(entity: Task): TaskDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      dueDate: entity.dueDate,
      projectId: entity.project.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

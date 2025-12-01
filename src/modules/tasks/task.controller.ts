import { NextFunction, Request, Response } from 'express';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/CreateTaskDto';
import { TaskDto } from './dto/TaskDto';
import { UpdateTaskDto } from './dto/UpdateTaskDto';

export class TaskController {
  constructor(private taskService: TaskService) {}

  getById = async (
    req: Request<{ id: string }, TaskDto, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.taskService.getTaskById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getByProjectId = async (
    req: Request<{ projectId: string }, TaskDto[], {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.taskService.getTasksByProjectId(req.params.projectId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request<{}, TaskDto, CreateTaskDto>, res: Response, next: NextFunction) => {
    try {
      const result = await this.taskService.addTask(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }, TaskDto, UpdateTaskDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.taskService.updateTask(req.body, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request<{ id: string }, TaskDto, {}>, res: Response, next: NextFunction) => {
    try {
      const result = await this.taskService.deleteTask(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

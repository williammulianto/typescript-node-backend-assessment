import { NextFunction, Request, Response } from 'express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/CreateProjectDto';
import { ProjectDto } from './dto/ProjectDto';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.projectService.getAllProjects();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request<{ id: string }, ProjectDto, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.projectService.getProjectById(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request<{}, ProjectDto, CreateProjectDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.projectService.addProject(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}

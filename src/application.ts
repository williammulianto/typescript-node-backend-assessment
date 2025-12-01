import express, { Express } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Database } from 'utils/db';
import { ProjectService } from 'modules/projects/project.service';
import { ProjectController } from 'modules/projects/project.controller';
import { ProjectRoute } from 'modules/projects/project.route';
import { TaskService } from 'modules/tasks/task.service';
import { TaskController } from 'modules/tasks/task.controller';
import { TaskRoute } from 'modules/tasks/task.route';
import { errorHandler } from 'middlewares/error.middleware';
import { OverdueTasksJob } from 'jobs/overdue-tasks.job';

export class Bootstrap {
  private app: Express;
  private overdueTasksJob: OverdueTasksJob;

  constructor(
    private db: Database,
    private port: number
  ) {}

  public init() {
    this.app = express();
    this.app.use(express.json());

    this.app.use((req, res, next) => {
      RequestContext.create(this.db.em, next);
    });

    this.registerRoutes();

    this.app.use(errorHandler);
  }

  public registerRoutes() {
    const projectService = new ProjectService(this.db.projectRepository, this.db.em);
    const projectController = new ProjectController(projectService);
    const projectRoute = new ProjectRoute(projectController);
    this.app.use(projectRoute.prefix, projectRoute.route);

    const taskService = new TaskService(
      this.db.taskRepository,
      this.db.projectRepository,
      this.db.em
    );
    const taskController = new TaskController(taskService);
    const taskRoute = new TaskRoute(taskController);
    this.app.use(taskRoute.prefix, taskRoute.route);

    this.overdueTasksJob = new OverdueTasksJob(this.db.em);
    this.overdueTasksJob.start();
  }

  public start() {
    this.app.listen(this.port);
  }

  public getApp() {
    // in case we need for testing.
    return this.app;
  }
}

import express, { Express } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Database } from 'utils/db';
import { ProjectService } from 'modules/projects/project.service';
import { ProjectController } from 'modules/projects/project.controller';
import { ProjectRoute } from 'modules/projects/project.route';

export class Bootstrap {
  private app: Express;

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

    const projectService = new ProjectService(this.db.projectRepository, this.db.em);
    const projectController = new ProjectController(projectService);
    const projectRoute = new ProjectRoute(projectController);

    this.app.use(projectRoute.prefix, projectRoute.route);
  }

  public start() {
    console.log(`server started at ${this.port}`);
    this.app.listen(this.port);
  }

  public getApp() {
    // in case we need for testing.
    return this.app;
  }
}

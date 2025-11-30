import { BaseRoute } from 'utils/base-route';
import { ProjectController } from './project.controller';

export class ProjectRoute extends BaseRoute {
  constructor(private projectController: ProjectController) {
    super('/projects');
    this.registerRoutes();
  }
  protected registerRoutes(): void {
    this.get('/', this.projectController.getAll);
    this.get('/:id', this.projectController.getById);
    this.post('/', this.projectController.create);
  }
}

import { BaseRoute } from 'utils/base-route';
import { ProjectController } from './project.controller';
import { CreateProjectDto } from './dto/CreateProjectDto';
import { validateDto } from 'middlewares/class-validator.middleware';

export class ProjectRoute extends BaseRoute {
  constructor(private projectController: ProjectController) {
    super('/projects');
    this.registerRoutes();
  }
  protected registerRoutes(): void {
    this.get('/', this.projectController.getAll);
    this.get('/:id', this.projectController.getById);
    this.post('/', validateDto(CreateProjectDto), this.projectController.create);
  }
}

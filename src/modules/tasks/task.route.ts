import { BaseRoute } from 'utils/base-route';
import { TaskController } from './task.controller';
import { CreateTaskDto } from './dto/CreateTaskDto';
import { validateDto } from 'middlewares/class-validator.middleware';
import { UpdateTaskDto } from './dto/UpdateTaskDto';

export class TaskRoute extends BaseRoute {
  constructor(private taskController: TaskController) {
    super('/tasks');
    this.registerRoutes();
  }
  protected registerRoutes(): void {
    this.get('/project/:projectId', this.taskController.getByProjectId);
    this.get('/:id', this.taskController.getById);
    this.post('/', validateDto(CreateTaskDto), this.taskController.create);
    this.post('/:id', validateDto(UpdateTaskDto), this.taskController.update);
    this.delete('/:id', this.taskController.delete);
  }
}

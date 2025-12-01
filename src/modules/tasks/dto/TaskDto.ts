import { TaskStatus } from 'entities/Task';

export class TaskDto {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  dueDate: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

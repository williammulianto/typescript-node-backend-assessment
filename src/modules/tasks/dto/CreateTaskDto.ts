import { IsNotEmpty, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { TaskStatus } from 'entities/Task';

export class CreateTaskDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsDateString()
  dueDate: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}

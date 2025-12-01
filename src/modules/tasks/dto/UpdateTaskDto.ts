import { IsOptional, IsEnum, IsDateString, IsUUID, IsString } from 'class-validator';
import { TaskStatus } from 'entities/Task';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}

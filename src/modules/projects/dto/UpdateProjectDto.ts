import { IsBoolean, IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateProjectDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  isArchived: boolean;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

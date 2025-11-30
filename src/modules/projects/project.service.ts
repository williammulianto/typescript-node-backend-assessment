import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { Project } from 'entities/Project';
import { CreateProjectDto } from './dto/CreateProjectDto';
import { ProjectDto } from './dto/ProjectDto';
import { validateDateRange } from 'utils/validation';
import { ValidationError } from 'utils/errors';
import { PROJECT_ERROR_CODE } from './errors/project.error_code';

export class ProjectService {
  constructor(
    private projectRepo: EntityRepository<Project>,
    private em: EntityManager
  ) {}

  async getAllProjects() {
    const projects = await this.projectRepo.find({});
    const projectsDto = projects.map((p) => this.mapToDto(p));
    return projectsDto;
  }

  async getProjectById(id: string) {
    const project = await this.projectRepo.findOne({ id: id });
    const projectDto = this.mapToDto(project);
    return projectDto;
  }

  async addProject(data: CreateProjectDto) {
    //validate if project date range is valid.
    if (validateDateRange(data.startDate, data.endDate) == false) {
      throw new ValidationError(
        'endDate cannot be earlier than startDate',
        PROJECT_ERROR_CODE.INVALID_DATE
      );
    }

    const entity = new Project();
    entity.name = data.name;
    entity.description = data.description;
    entity.isArchived = data.isArchived;
    entity.startDate = new Date(data.startDate);
    entity.endDate = new Date(data.endDate);
    await this.em.persistAndFlush(entity);
    return this.mapToDto(entity);
  }

  mapToDto(entity: Project): ProjectDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

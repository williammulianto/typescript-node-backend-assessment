import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectService } from 'modules/projects/project.service';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { Project } from 'entities/Project';
import { CreateProjectDto } from 'modules/projects/dto/CreateProjectDto';
import { UpdateProjectDto } from 'modules/projects/dto/UpdateProjectDto';
import { NotFoundError, ValidationError } from 'utils/errors';

describe('ProjectService Unit Tests', () => {
  let projectService: ProjectService;
  let mockProjectRepo: EntityRepository<Project>;
  let mockEntityManager: EntityManager;

  beforeEach(() => {
    mockProjectRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
    } as unknown as EntityRepository<Project>;

    mockEntityManager = {
      persistAndFlush: vi.fn(),
    } as unknown as EntityManager;

    projectService = new ProjectService(mockProjectRepo, mockEntityManager);
  });

  describe('getAllProjects', () => {
    it('should return an array of project DTOs', async () => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Test Project 1',
          description: 'Description 1',
          isArchived: false,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        } as Project,
        {
          id: '2',
          name: 'Test Project 2',
          description: 'Description 2',
          isArchived: true,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-11-30'),
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        } as Project,
      ];

      vi.mocked(mockProjectRepo.find).mockResolvedValue(mockProjects);

      const result = await projectService.getAllProjects();

      expect(mockProjectRepo.find).toHaveBeenCalledWith({ deletedAt: null });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockProjects[0]);
      expect(result[1].id).toBe('2');
    });

    it('should return an empty array when no projects exist', async () => {
      vi.mocked(mockProjectRepo.find).mockResolvedValue([]);
      const result = await projectService.getAllProjects();
      expect(result).toEqual([]);
    });
  });

  describe('getProjectById', () => {
    it('should return a project DTO when project exists', async () => {
      // Arrange
      const mockProject: Project = {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Project;

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);

      // Act
      const result = await projectService.getProjectById('1');

      // Assert
      expect(mockProjectRepo.findOne).toHaveBeenCalledWith({ id: '1', deletedAt: null });
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);
      await expect(projectService.getProjectById('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('addProject', () => {
    it('should create and return a new project when data is valid', async () => {
      const createDto: CreateProjectDto = {
        name: 'New Project',
        description: 'New Description',
        isArchived: false,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);
      const result = await projectService.addProject(createDto);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(1);

      expect(result).toHaveProperty('name', 'New Project');
      expect(result).toHaveProperty('description', 'New Description');
    });

    it('should throw ValidationError when endDate is before startDate', async () => {
      const invalidDto: CreateProjectDto = {
        name: 'Invalid Project',
        description: 'Invalid dates',
        isArchived: false,
        startDate: '2024-12-31',
        endDate: '2024-01-01', // Invalid date
      };

      await expect(projectService.addProject(invalidDto)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when dates are invalid', async () => {
      const invalidDto: CreateProjectDto = {
        name: 'Invalid Project',
        description: 'Invalid dates',
        isArchived: false,
        startDate: 'invalid-date',
        endDate: '2024-12-31',
      };

      await expect(projectService.addProject(invalidDto)).rejects.toThrow(ValidationError);
    });
  });

  describe('mapToDto', () => {
    it('should correctly map entity to DTO', () => {
      // Arrange
      const entity: Project = {
        id: 'test-id',
        name: 'Test Project',
        description: 'Test Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-06-01T15:30:00Z'),
      } as Project;

      // Act
      const result = projectService.mapToDto(entity);

      // Assert
      expect(result).toEqual({
        id: 'test-id',
        name: 'Test Project',
        description: 'Test Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-06-01T15:30:00Z'),
      });
    });
  });

  describe('updateProject', () => {
    it('should successfully update a project with valid data', async () => {
      // Arrange
      const updateDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'Updated Description',
        isArchived: true,
        startDate: '2024-02-01',
        endDate: '2024-11-30',
      };

      const existingProject: Project = {
        id: '1',
        name: 'Old Project',
        description: 'Old Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as Project;

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(existingProject);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      // Act
      const result = await projectService.updateProject(updateDto, '1');

      // Assert
      expect(mockProjectRepo.findOne).toHaveBeenCalledWith({ id: '1', deletedAt: null });
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('name', 'Updated Project');
      expect(result).toHaveProperty('description', 'Updated Description');
      expect(result).toHaveProperty('isArchived', true);
      expect(result.startDate).toEqual(new Date('2024-02-01'));
      expect(result.endDate).toEqual(new Date('2024-11-30'));
    });

    it('should throw ValidationError when endDate is before startDate', async () => {
      // Arrange
      const invalidDto: UpdateProjectDto = {
        name: 'Invalid Project',
        description: 'Invalid dates',
        isArchived: false,
        startDate: '2024-12-31',
        endDate: '2024-01-01', // Invalid: endDate before startDate
      };

      // Act & Assert
      await expect(projectService.updateProject(invalidDto, '1')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when dates are invalid', async () => {
      // Arrange
      const invalidDto: UpdateProjectDto = {
        name: 'Invalid Project',
        description: 'Invalid dates',
        isArchived: false,
        startDate: 'invalid-date',
        endDate: '2024-12-31',
      };

      // Act & Assert
      await expect(projectService.updateProject(invalidDto, '1')).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      // Arrange
      const updateDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'Updated Description',
        isArchived: false,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);

      // Act & Assert
      await expect(projectService.updateProject(updateDto, 'non-existent-id')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('deleteProject', () => {
    it('should successfully soft delete a project', async () => {
      // Arrange
      const mockProject: Project = {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      } as Project;

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      // Act
      const result = await projectService.deleteProject('1');

      // Assert
      expect(mockProjectRepo.findOne).toHaveBeenCalledWith({ id: '1' });
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(1);
      expect(mockProject.deletedAt).toBeInstanceOf(Date);
      expect(result).toHaveProperty('name', 'Test Project');
    });

    it('should throw NotFoundError when project does not exist', async () => {
      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(null);
      await expect(projectService.deleteProject('non-existent-id')).rejects.toThrow(NotFoundError);
    });

    it('should set deletedAt timestamp correctly', async () => {
      const mockProject: Project = {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
        isArchived: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      } as Project;

      vi.mocked(mockProjectRepo.findOne).mockResolvedValue(mockProject);
      vi.mocked(mockEntityManager.persistAndFlush).mockResolvedValue(undefined);

      // Act
      await projectService.deleteProject('1');
      // Assert
      expect(mockProject.deletedAt).toBeInstanceOf(Date);
    });
  });
});

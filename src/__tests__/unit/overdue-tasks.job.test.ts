import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OverdueTasksJob } from 'jobs/overdue-tasks.job';
import * as cron from 'node-cron';
import { EntityManager } from '@mikro-orm/sqlite';

const mockFindOverdueTask = vi.fn();
const mockMarkTaskAsOverdue = vi.fn();

vi.mock('modules/tasks/task.service', () => {
  return {
    TaskService: class {
      findOverdueTasks = mockFindOverdueTask;
      markTasksAsOverdue = mockMarkTaskAsOverdue;
      constructor(_taskRepo: any, _projectRepo: any, _em: any) {}
    },
  };
});

vi.mock('node-cron', () => ({
  schedule: vi.fn(),
}));

describe('OverdueTasksJob', () => {
  let overdueTasksJob: OverdueTasksJob;
  let mockEm: any;

  beforeEach(() => {
    mockFindOverdueTask.mockClear();
    mockMarkTaskAsOverdue.mockClear();

    mockEm = {
      fork: vi.fn().mockReturnThis(),
      clear: vi.fn().mockResolvedValue(undefined),
      getRepository: vi.fn().mockReturnValue({}),
    } as any as EntityManager;

    overdueTasksJob = new OverdueTasksJob(mockEm);
  });

  describe('start', () => {
    it('should find and mark overdue tasks when cron runs', async () => {
      mockFindOverdueTask.mockResolvedValue([{ id: 'task-1' }]);
      mockMarkTaskAsOverdue.mockResolvedValue(1);

      let cronCallback: Function;
      vi.mocked(cron.schedule).mockImplementation((expr, cb) => {
        cronCallback = cb;
        return { stop: vi.fn() } as any;
      });

      overdueTasksJob.start();

      // Call the cron callback and wait for it
      await cronCallback!();

      expect(mockFindOverdueTask).toHaveBeenCalled();
      expect(mockMarkTaskAsOverdue).toHaveBeenCalledWith(['task-1']);
    });

    it('should not mark tasks if none are overdue', async () => {
      mockFindOverdueTask.mockResolvedValue([]);

      let cronCallback: Function;
      vi.mocked(cron.schedule).mockImplementation((expr, cb) => {
        cronCallback = cb;
        return { stop: vi.fn() } as any;
      });

      overdueTasksJob.start();
      await cronCallback!();

      expect(mockFindOverdueTask).toHaveBeenCalled();
      expect(mockMarkTaskAsOverdue).not.toHaveBeenCalled();
    });
  });
});

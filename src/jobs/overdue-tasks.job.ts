import * as cron from 'node-cron';
import { TaskService } from 'modules/tasks/task.service';
import { Logger } from 'utils/logger';
import { EntityManager } from '@mikro-orm/sqlite';
import { Task } from 'entities/Task';
import { Project } from 'entities/Project';

const logger = new Logger('OverdueTasksJob');

export class OverdueTasksJob {
  private task: cron.ScheduledTask | null = null;

  constructor(private em: EntityManager) {}

  start() {
    const CRON_EXPRESSION_EVERY_MINUTE = '* * * * *';

    this.task = cron.schedule(CRON_EXPRESSION_EVERY_MINUTE, async () => {
      //https://mikro-orm.io/docs/identity-map#forking-entity-manager
      const forkedEm = this.em.fork();

      try {
        logger.info('Running overdue tasks check...');

        const taskRepo = forkedEm.getRepository(Task);
        const projectRepo = forkedEm.getRepository(Project);
        const taskService = new TaskService(taskRepo, projectRepo, forkedEm);

        const overdueTasks = await taskService.findOverdueTasks();

        if (overdueTasks.length === 0) {
          logger.info('No overdue tasks found');
          return;
        }

        const taskIds = overdueTasks.map((task) => task.id);
        const updatedCount = await taskService.markTasksAsOverdue(taskIds);

        logger.info(`Marked ${updatedCount} tasks as overdue`, {
          taskIds,
        });
      } catch (error) {
        logger.error('Error checking overdue tasks', {
          error: error instanceof Error ? error.message : error,
        });
      } finally {
        forkedEm.clear();
      }
    });

    logger.info('Overdue tasks cron job started (runs every minute)');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      logger.info('Overdue tasks cron job stopped');
    }
  }
}

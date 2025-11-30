import { EntityManager, EntityRepository, MikroORM, Options } from '@mikro-orm/sqlite';
import { Project } from 'entities/Project';

// Reference : https://mikro-orm.io/docs/guide/project-setup#basic-dependency-injection-container
export class Database {
  private static instance: Database | null = null;

  public orm: MikroORM;
  public em: EntityManager;

  public projectRepository: EntityRepository<Project>;

  constructor() {}

  public static async init(option?: Options) {
    if (!Database.instance) {
      const db = new Database();
      db.orm = await MikroORM.init(option);
      db.em = db.orm.em;
      db.projectRepository = db.em.getRepository(Project);
      this.instance = db;
    }
    return Database.instance;
  }
}

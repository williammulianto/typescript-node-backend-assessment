import { RequestHandler, Router } from 'express';
import { Logger } from './logger';

export abstract class BaseRoute {
  public route: Router;

  public prefix: string;
  protected logger: Logger;

  constructor(prefix: string) {
    this.route = Router();
    this.prefix = prefix;
    if (!prefix.startsWith('/')) {
      throw new Error(`Route prefix "${prefix}" must start with "/". Example: "/projects"`);
    }
    this.logger = new Logger(this.constructor.name);
  }

  protected get(path: string, ...handlers: RequestHandler[]) {
    this.logger.info(`Route registered: [GET] ${this.prefix}${path}`);
    this.route.get(path, ...handlers);
  }

  protected post(path: string, ...handlers: RequestHandler[]) {
    this.logger.info(`Route registered: [POST] ${this.prefix}${path}`);
    this.route.post(path, ...handlers);
  }

  protected delete(path: string, ...handlers: RequestHandler[]) {
    this.logger.info(`Route registered: [DELETE] ${this.prefix}${path}`);
    this.route.delete(path, ...handlers);
  }

  protected abstract registerRoutes(): void;
}

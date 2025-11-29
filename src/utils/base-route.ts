import { Router } from 'express';

export abstract class BaseRoute {
  public route: Router;

  constructor() {
    this.route = Router();
    this.registerRoutes();
  }

  protected abstract registerRoutes(): void;
}

import express, { Express } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Database } from 'utils/db';

export class Bootstrap {
  private app: Express;

  constructor(
    private db: Database,
    private port: number
  ) {}

  public init() {
    this.app = express();
    this.app.use(express.json());

    this.app.use((req, res, next) => {
      RequestContext.create(this.db.em, next);
    });
  }

  public start() {
    console.log(`server started at ${this.port}`);
    this.app.listen(this.port);
  }

  public getApp() {
    // in case we need for testing.
    return this.app;
  }
}

import { PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export abstract class BaseEntity {
  @PrimaryKey({ columnType: 'uuid' })
  id: string = randomUUID();

  @Property({ nullable: true, type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({
    nullable: true,
    onUpdate: () => new Date(),
    type: 'timestamp',
  })
  updatedAt: Date = new Date();

  @Property({ nullable: true, type: 'timestamp' })
  deletedAt: Date;
}

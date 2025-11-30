import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Project extends BaseEntity {
  @Property()
  name: string;

  @Property()
  description: string;

  @Property({ default: false })
  isArchived: boolean = false;

  @Property({ type: 'timestamp' })
  startDate: Date;

  @Property({ type: 'timestamp' })
  endDate: Date;
}

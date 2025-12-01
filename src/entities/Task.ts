import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Project } from './Project';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Task extends BaseEntity {
  @Property()
  name: string;

  @Property()
  description: string;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.PENDING;

  @Property({ type: 'timestamp' })
  dueDate: Date;

  @ManyToOne(() => Project)
  project: Project;
}

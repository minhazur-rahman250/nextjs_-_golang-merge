import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Lesson } from './lesson.entity.js';
import { User } from '../../user/entities/user.entity.js';


@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => User, { eager: false })
  teacher: Relation<User>;

  @Column()
  teacherId: number;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons: Relation<Lesson>[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
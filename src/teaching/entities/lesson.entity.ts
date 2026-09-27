import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { Course } from './course.entity.js';


@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
  course: Relation<Course>;

  @Column()
  courseId: number;
}
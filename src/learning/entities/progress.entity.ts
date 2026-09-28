import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { Enrollment } from './enrollment.entity.js';
import { Lesson } from '../../teaching/entities/lesson.entity.js';

@Entity()
@Unique(['enrollmentId', 'lessonId']) // একই lesson এর জন্য একটাই progress record থাকবে
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress, { onDelete: 'CASCADE' })
  enrollment: Relation<Enrollment>;

  @Column()
  enrollmentId: number;

  @ManyToOne(() => Lesson)
  lesson: Relation<Lesson>;

  @Column()
  lessonId: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  completedAt: Date;
}
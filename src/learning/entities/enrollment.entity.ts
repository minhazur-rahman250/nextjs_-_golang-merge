import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Course } from '../../teaching/entities/course.entity.js';
import { Progress } from './progress.entity.js';

@Entity()
@Unique(['studentId', 'courseId']) // একজন student একই course এ দুইবার enroll করতে পারবে না
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  student: Relation<User>;

  @Column()
  studentId: number;

  @ManyToOne(() => Course)
  course: Relation<Course>;

  @Column()
  courseId: number;

  @OneToMany(() => Progress, (progress) => progress.enrollment, { cascade: true })
  progress: Relation<Progress>[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;
}
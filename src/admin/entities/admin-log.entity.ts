import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

@Entity()
export class AdminLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  admin: Relation<User>;

  @Column()
  adminId: number;

  @Column()
  action: string; // যেমন: CHANGE_ROLE, DEACTIVATE_USER, DELETE_COURSE

  @Column({ nullable: true })
  targetId: number; // যার/যেটার উপর কাজ হলো (user id বা course id)

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
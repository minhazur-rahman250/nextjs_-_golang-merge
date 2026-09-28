import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity.js';
import { Course } from '../teaching/entities/course.entity.js';
import { Enrollment } from '../learning/entities/enrollment.entity.js';
import { AdminLog } from './entities/admin-log.entity.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Enrollment, AdminLog])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
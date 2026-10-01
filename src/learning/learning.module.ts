import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { Progress } from './entities/progress.entity.js';
import { Course } from '../teaching/entities/course.entity.js';
import { Lesson } from '../teaching/entities/lesson.entity.js';
import { LearningController } from './learning.controller.js';
import { LearningService } from './learning.service.js';
import { NotificationModule } from '../notification/notification.module.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Progress, Course, Lesson]),
  NotificationModule,
  UserModule,
],
  
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
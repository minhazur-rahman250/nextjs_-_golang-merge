import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller.js';
import { Course } from './entities/course.entity.js';
import { Lesson } from './entities/lesson.entity.js';
import { CourseService } from './course.service.js';


@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class TeachingModule {}
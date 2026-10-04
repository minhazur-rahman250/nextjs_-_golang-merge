import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity.js';
import { Lesson } from './entities/lesson.entity.js';
import { CourseService } from './course.service.js';
import { CourseController } from './course.controller.js';
import { SearchModule } from '../search/search.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson]), SearchModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class TeachingModule {}
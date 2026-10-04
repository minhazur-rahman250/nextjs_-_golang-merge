import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../teaching/entities/course.entity.js';
import { Lesson } from '../teaching/entities/lesson.entity.js';
import { Enrollment } from '../learning/entities/enrollment.entity.js';
import { User } from '../user/entities/user.entity.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [
    HttpModule.register({ timeout: 5000 }),
    ConfigModule,
    TypeOrmModule.forFeature([Course, Lesson, Enrollment, User]),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
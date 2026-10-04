import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Course } from '../teaching/entities/course.entity.js';
import { Lesson } from '../teaching/entities/lesson.entity.js';
import { Enrollment } from '../learning/entities/enrollment.entity.js';
import { User } from '../user/entities/user.entity.js';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly goServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Lesson) private lessonRepository: Repository<Lesson>,
    @InjectRepository(Enrollment) private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.goServiceUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
      'http://localhost:8080',
    );
  }

  // courseId দিলে Course, User (teacher), Lesson count, Enrollment count -
  // চারটা টেবিল থেকে ডেটা একত্র করে Go search index এ পাঠায়
  async syncCourseIndex(courseId: number): Promise<void> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      this.logger.warn(`syncCourseIndex: courseId ${courseId} পাওয়া যায়নি`);
      return;
    }

    const teacher = await this.userRepository.findOneBy({ id: course.teacherId });

    const lessonCount = await this.lessonRepository.count({ where: { courseId } });
    const enrollmentCount = await this.enrollmentRepository.count({ where: { courseId } });

    try {
      await firstValueFrom(
        this.httpService.post(`${this.goServiceUrl}/search/index`, {
          courseId: course.id,
          title: course.title,
          description: course.description,
          price: Number(course.price),
          teacherName: teacher?.name ?? 'Unknown',
          lessonCount,
          enrollmentCount,
          isPublished: course.isPublished,
        }),
      );
      this.logger.log(`Course indexed: ${course.title} (lessons: ${lessonCount}, enrollments: ${enrollmentCount})`);
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`Course index করতে ব্যর্থ (courseId: ${courseId}): ${err.message}`);
    }
  }

  async removeFromIndex(courseId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.goServiceUrl}/search/index/${courseId}`),
      );
      this.logger.log(`Course index থেকে সরানো হয়েছে: ${courseId}`);
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`Course index থেকে সরাতে ব্যর্থ (courseId: ${courseId}): ${err.message}`);
    }
  }
}
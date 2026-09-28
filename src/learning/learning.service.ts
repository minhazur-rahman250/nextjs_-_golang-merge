import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { Progress } from './entities/progress.entity.js';
import { Course } from '../teaching/entities/course.entity.js';
import { Lesson } from '../teaching/entities/lesson.entity.js';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async enroll(courseId: number, studentId: number): Promise<Enrollment> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException('Course পাওয়া যায়নি');
    if (!course.isPublished) {
      throw new BadRequestException('এই course এখনো publish হয়নি, enroll করা যাবে না');
    }

    const existing = await this.enrollmentRepository.findOneBy({ studentId, courseId });
    if (existing) throw new ConflictException('তুমি আগেই এই course এ enroll করেছ');

    const enrollment = this.enrollmentRepository.create({ studentId, courseId });
    return this.enrollmentRepository.save(enrollment);
  }

  async findMyEnrollments(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: { course: true },
      order: { enrolledAt: 'DESC' },
    });
  }

  // Ownership check - নিজের enrollment ছাড়া access করা যাবে না
  private async verifyEnrollmentOwnership(
    enrollmentId: number,
    studentId: number,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOneBy({ id: enrollmentId });
    if (!enrollment) throw new NotFoundException('Enrollment পাওয়া যায়নি');
    if (enrollment.studentId !== studentId) {
      throw new ForbiddenException('এটা তোমার enrollment না');
    }
    return enrollment;
  }

  async markLessonComplete(
    enrollmentId: number,
    lessonId: number,
    studentId: number,
  ): Promise<Progress> {
    const enrollment = await this.verifyEnrollmentOwnership(enrollmentId, studentId);

    // চেক করি lesson-টা আসলে এই enrollment এর course এর ভেতরেই আছে কিনা
    const lesson = await this.lessonRepository.findOneBy({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson পাওয়া যায়নি');
    if (lesson.courseId !== enrollment.courseId) {
      throw new BadRequestException('এই lesson তোমার enroll করা course এর অংশ না');
    }

    let progress = await this.progressRepository.findOneBy({ enrollmentId, lessonId });

    if (progress) {
      progress.completed = true;
      progress.completedAt = new Date();
    } else {
      progress = this.progressRepository.create({
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
    }

    return this.progressRepository.save(progress);
  }

  async getProgressSummary(enrollmentId: number, studentId: number) {
    const enrollment = await this.verifyEnrollmentOwnership(enrollmentId, studentId);

    const totalLessons = await this.lessonRepository.count({
      where: { courseId: enrollment.courseId },
    });

    const completedLessons = await this.progressRepository.count({
      where: { enrollmentId, completed: true },
    });

    const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    return {
      enrollmentId,
      courseId: enrollment.courseId,
      totalLessons,
      completedLessons,
      percentage,
    };
  }
}
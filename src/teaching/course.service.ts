import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { Lesson } from './entities/lesson.entity.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { QueryCourseDto } from './dto/query-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';


@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async create(dto: CreateCourseDto, teacherId: number): Promise<Course> {
    const course = this.courseRepository.create({ ...dto, teacherId });
    return this.courseRepository.save(course);
  }

  // পাবলিক লিস্টিং - pagination + search সহ, শুধু published কোর্স
  async findAll(query: QueryCourseDto) {
    const { page = 1, limit = 10, search } = query;

    const [data, total] = await this.courseRepository.findAndCount({
      where: {
        isPublished: true,
        ...(search ? { title: Like(`%${search}%`) } : {}),
      },
      relations: { teacher: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async findMyCourses(teacherId: number): Promise<Course[]> {
    return this.courseRepository.find({
      where: { teacherId },
      relations: { lessons: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: { teacher: true, lessons:true },
    });
    if (!course) throw new NotFoundException(`Course with id ${id} পাওয়া যায়নি`);
    return course;
  }

  // Object-level authorization - নিজের কোর্স ছাড়া কেউ এডিট করতে পারবে না
  private async verifyOwnership(courseId: number, teacherId: number): Promise<Course> {
    const course = await this.findOne(courseId);
    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('তুমি শুধু নিজের কোর্স এডিট করতে পারবে');
    }
    return course;
  }

  async update(id: number, dto: UpdateCourseDto, teacherId: number): Promise<Course> {
    const course = await this.verifyOwnership(id, teacherId);
    Object.assign(course, dto);
    return this.courseRepository.save(course);
  }

  async remove(id: number, teacherId: number): Promise<void> {
    await this.verifyOwnership(id, teacherId);
    await this.courseRepository.delete(id);
  }

  async addLesson(courseId: number, dto: CreateLessonDto, teacherId: number): Promise<Lesson> {
    await this.verifyOwnership(courseId, teacherId);
    const lesson = this.lessonRepository.create({ ...dto, courseId });
    return this.lessonRepository.save(lesson);
  }

  async updateLesson(
    lessonId: number,
    dto: Partial<CreateLessonDto>,
    teacherId: number,
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: { course: true },
    });
    if (!lesson) throw new NotFoundException('Lesson পাওয়া যায়নি');
    if (lesson.course.teacherId !== teacherId) {
      throw new ForbiddenException('তুমি শুধু নিজের কোর্সের লেসন এডিট করতে পারবে');
    }
    Object.assign(lesson, dto);
    return this.lessonRepository.save(lesson);
  }

  async removeLesson(lessonId: number, teacherId: number): Promise<void> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: { course: true },
    });
    if (!lesson) throw new NotFoundException('Lesson পাওয়া যায়নি');
    if (lesson.course.teacherId !== teacherId) {
      throw new ForbiddenException('তুমি শুধু নিজের কোর্সের লেসন ডিলিট করতে পারবে');
    }
    await this.lessonRepository.delete(lessonId);
  }
}
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from '../user/entities/user.entity.js';
import { Course } from '../teaching/entities/course.entity.js';
import { Enrollment } from '../learning/entities/enrollment.entity.js';
import { AdminLog } from './entities/admin-log.entity.js';
import { QueryAdminDto } from './dto/query-admin.dto.js';
import { Role } from '../common/enums/role.enum.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment) private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(AdminLog) private logRepository: Repository<AdminLog>,
  ) {}

  // Audit trail: প্রতিটা admin action রেকর্ড হয়
  private async log(adminId: number, action: string, targetId?: number, details?: string) {
    await this.logRepository.save(
      this.logRepository.create({ adminId, action, targetId, details }),
    );
  }

  // ---------- Stats ----------
  async getStats() {
    const [totalUsers, students, teachers, admins, totalCourses, publishedCourses, totalEnrollments] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { role: Role.STUDENT } }),
        this.userRepository.count({ where: { role: Role.TEACHER } }),
        this.userRepository.count({ where: { role: Role.ADMIN } }),
        this.courseRepository.count(),
        this.courseRepository.count({ where: { isPublished: true } }),
        this.enrollmentRepository.count(),
      ]);

    return {
      users: { total: totalUsers, students, teachers, admins },
      courses: { total: totalCourses, published: publishedCourses },
      enrollments: totalEnrollments,
    };
  }

  // ---------- User management ----------
  async listUsers(query: QueryAdminDto) {
    const { page = 1, limit = 10, search, role } = query;

    const base: FindOptionsWhere<User> = role ? { role } : {};
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = search
      ? [
          { ...base, name: ILike(`%${search}%`) },
          { ...base, email: ILike(`%${search}%`) },
        ]
      : base;

    const [data, total] = await this.userRepository.findAndCount({
      where,
      // password কখনো select করা হচ্ছে না
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
  }

  async changeRole(adminId: number, targetId: number, role: Role) {
    if (adminId === targetId) {
      throw new BadRequestException('নিজের role নিজে পরিবর্তন করা যাবে না');
    }
    const user = await this.userRepository.findOneBy({ id: targetId });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');

    const oldRole = user.role;
    user.role = role;
    await this.userRepository.save(user);
    await this.log(adminId, 'CHANGE_ROLE', targetId, `${oldRole} -> ${role}`);

    return { id: user.id, email: user.email, role: user.role };
  }

  async setUserStatus(adminId: number, targetId: number, isActive: boolean) {
    if (adminId === targetId) {
      throw new BadRequestException('নিজের একাউন্ট নিজে নিষ্ক্রিয় করা যাবে না');
    }
    const user = await this.userRepository.findOneBy({ id: targetId });
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');

    user.isActive = isActive;
    await this.userRepository.save(user);
    await this.log(adminId, isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', targetId);

    return { id: user.id, email: user.email, isActive: user.isActive };
  }

  // ---------- Course moderation ----------
  async listAllCourses(query: QueryAdminDto) {
    const { page = 1, limit = 10, search } = query;

    const [data, total] = await this.courseRepository.findAndCount({
      where: search ? { title: ILike(`%${search}%`) } : {},
      relations: { teacher: true },
      select: {
        id: true, title: true, price: true, isPublished: true, createdAt: true,
        teacher: { id: true, name: true, email: true },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
  }

  async setCoursePublish(adminId: number, courseId: number, isPublished: boolean) {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException('Course পাওয়া যায়নি');

    course.isPublished = isPublished;
    await this.courseRepository.save(course);
    await this.log(adminId, isPublished ? 'PUBLISH_COURSE' : 'UNPUBLISH_COURSE', courseId);

    return { id: course.id, title: course.title, isPublished: course.isPublished };
  }

  async deleteCourse(adminId: number, courseId: number) {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException('Course পাওয়া যায়নি');

    await this.courseRepository.delete(courseId);
    await this.log(adminId, 'DELETE_COURSE', courseId, course.title);
  }

  // ---------- Audit logs ----------
  async getLogs(query: QueryAdminDto) {
    const { page = 1, limit = 10 } = query;
    const [data, total] = await this.logRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
  }
}
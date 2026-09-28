import { Controller, Post, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LearningService } from './learning.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guards.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';

@Controller('learning')
@UseGuards(AuthGuard('jwt'), RolesGuard) // পুরো controller এর জন্য একবারেই Guard বসিয়ে দিলাম
export class LearningController {
  constructor(private learningService: LearningService) {}

  @Post('enroll/:courseId')
  @Roles(Role.STUDENT)
  enroll(@Param('courseId', ParseIntPipe) courseId: number, @CurrentUser() user:any) {
    return this.learningService.enroll(courseId, user.userId);
  }

  @Get('my-enrollments')
  @Roles(Role.STUDENT)
  findMyEnrollments(@CurrentUser() user:any) {
    return this.learningService.findMyEnrollments(user.userId);
  }

  @Post(':enrollmentId/lessons/:lessonId/complete')
  @Roles(Role.STUDENT)
  markComplete(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user:any,
  ) {
    return this.learningService.markLessonComplete(enrollmentId, lessonId, user.userId);
  }

  @Get(':enrollmentId/progress')
  @Roles(Role.STUDENT)
  getProgress(@Param('enrollmentId', ParseIntPipe) enrollmentId: number, @CurrentUser() user:any) {
    return this.learningService.getProgressSummary(enrollmentId, user.userId);
  }
}
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CourseService } from './course.service.js';
import { QueryCourseDto } from './dto/query-course.dto.js';
import { RolesGuard } from '../common/guards/roles.guards.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';


@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get()
  findAll(@Query() query: QueryCourseDto) {
    return this.courseService.findAll(query);
  }

  @Get('my-courses')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  findMyCourses(@CurrentUser() user:any) {
    return this.courseService.findMyCourses(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  create(@Body() dto: CreateCourseDto, @CurrentUser() user:any) {
    return this.courseService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user:any,
  ) {
    return this.courseService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user:any) {
    return this.courseService.remove(id, user.userId);
  }

  @Post(':id/lessons')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  addLesson(
    @Param('id', ParseIntPipe) courseId: number,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user:any,
  ) {
    return this.courseService.addLesson(courseId, dto, user.userId);
  }

  @Patch('lessons/:lessonId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  updateLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: Partial<CreateLessonDto>,
    @CurrentUser() user:any,
  ) {
    return this.courseService.updateLesson(lessonId, dto, user.userId);
  }

  @Delete('lessons/:lessonId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  removeLesson(@Param('lessonId', ParseIntPipe) lessonId: number, @CurrentUser() user:any) {
    return this.courseService.removeLesson(lessonId, user.userId);
  }
}
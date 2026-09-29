import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service.js';
import { ChangeRoleDto } from './dto/change-role.dto.js';
import { SetStatusDto } from './dto/set-status.dto.js';
import { SetPublishDto } from './dto/set-publish.dto.js';
import { QueryAdminDto } from './dto/query-admin.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guards.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';


@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN) // পুরো controller শুধু admin এর জন্য
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers(@Query() query: QueryAdminDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/role')
  changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() admin:any,
  ) {
    return this.adminService.changeRole(admin.userId, id, dto.role);
  }

  @Patch('users/:id/status')
  setUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetStatusDto,
    @CurrentUser() admin:any,
  ) {
    return this.adminService.setUserStatus(admin.userId, id, dto.isActive);
  }

  @Get('courses')
  listAllCourses(@Query() query: QueryAdminDto) {
    return this.adminService.listAllCourses(query);
  }

  @Patch('courses/:id/publish')
  setCoursePublish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPublishDto,
    @CurrentUser() admin:any,
  ) {
    return this.adminService.setCoursePublish(admin.userId, id, dto.isPublished);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id', ParseIntPipe) id: number, @CurrentUser() admin:any) {
    return this.adminService.deleteCourse(admin.userId, id);
  }

  @Get('logs')
  getLogs(@Query() query: QueryAdminDto) {
    return this.adminService.getLogs(query);
  }
}
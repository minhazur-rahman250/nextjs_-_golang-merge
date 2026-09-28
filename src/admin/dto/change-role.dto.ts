import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';

export class ChangeRoleDto {
  @IsEnum(Role, { message: 'role অবশ্যই admin/teacher/student এর একটা হতে হবে' })
  role: Role;
}
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';


export class RegisterDto {
  @IsNotEmpty({ message: 'নাম খালি রাখা যাবে না' })
  name: string;

  @IsEmail({}, { message: 'সঠিক email ফরম্যাট দিতে হবে' })
  email: string;

  @MinLength(6, { message: 'পাসওয়ার্ড কমপক্ষে 6 অক্ষরের হতে হবে' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role অবশ্যই admin/teacher/student এর একটা হতে হবে' })
  role: import("../../common/enums/role.enum.js").Role;; // না দিলে default STUDENT হবে
}
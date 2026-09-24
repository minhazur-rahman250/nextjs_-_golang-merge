import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'নাম খালি রাখা যাবে না' })
  name: string;

  @IsEmail({}, { message: 'সঠিক email ফরম্যাট দিতে হবে' })
  email: string;

  @MinLength(6, { message: 'পাসওয়ার্ড কমপক্ষে 6 অক্ষরের হতে হবে' })
  password: string;
}
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RegisterDto } from '../user/dto/register.dto.js';
import { LoginDto } from '../user/dto/login.dto.js';
import { Any } from 'typeorm';
import { CreateUserDto } from '../user/dto/create-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // valid token ছাড়া এই route এ ঢোকা যাবে না
  getProfile(@Req() req:any) {
   
    return req.user; // JwtStrategy এর validate() থেকে আসা ডেটা
  }
}
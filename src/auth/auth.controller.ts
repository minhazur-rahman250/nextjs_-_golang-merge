import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RegisterDto } from '../user/dto/register.dto.js';
import { LoginDto } from '../user/dto/login.dto.js';;
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // মিনিটে সর্বোচ্চ ৫ বার
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
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { LoginDto } from '../user/dto/login.dto.js';
import { RegisterDto } from '../user/dto/register.dto.js';
import { Role } from '../common/enums/role.enum.js';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
  if (dto.role === Role.ADMIN) {
    throw new ForbiddenException('Admin একাউন্ট সরাসরি register করা যায় না');
  }
  const user = await this.userService.create(dto);
  return this.generateToken(user.id, user.email, user.role);
}

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Email অথবা পাসওয়ার্ড ভুল');

    if (!user.isActive) throw new UnauthorizedException('তোমার একাউন্ট নিষ্ক্রিয় করা হয়েছে');
    
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email অথবা পাসওয়ার্ড ভুল');

    return this.generateToken(user.id, user.email, user.role);
  }

  private generateToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService, config: ConfigService) {
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
  });
}

  async validate(payload: { sub: number }) {
    const user = await this.userService.findOne(payload.sub);
    if (!user.isActive) {
      throw new UnauthorizedException('তোমার একাউন্ট নিষ্ক্রিয় করা হয়েছে');
    }
    // role DB থেকে নেওয়া হচ্ছে, তাই admin role বদলালে সাথে সাথে কার্যকর হবে
    return { userId: user.id, email: user.email, role: user.role };
  }
}
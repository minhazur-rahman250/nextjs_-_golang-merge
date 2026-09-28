import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { TeachingModule } from './teaching/teaching.module.js';
import { LearningModule } from './learning/learning.module.js';
import { AdminModule } from './admin/admin.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '4321',
      database: 'nest_golang_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    AuthModule, 
    TeachingModule,
    LearningModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

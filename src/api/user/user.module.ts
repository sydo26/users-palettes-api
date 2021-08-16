// import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DbModule } from '../../services/db';

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

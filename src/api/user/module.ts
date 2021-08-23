// import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { UserService } from './service';
import { DbModule } from '../../services/db';

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from '../services/db';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, DbModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

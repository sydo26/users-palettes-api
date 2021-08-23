import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DbModule } from '../services/db';
import { UserModule } from './user/module';
import { ColorModule } from './color/module';
import { PaletteModule } from './palette/module';
import { AuthModule } from './auth/module';

@Module({
  imports: [AuthModule, UserModule, ColorModule, PaletteModule, DbModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

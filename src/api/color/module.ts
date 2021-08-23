// import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ColorController } from './controller';
import { ColorService } from './service';
import { DbModule } from '../../services/db';

@Module({
  imports: [DbModule],
  controllers: [ColorController],
  providers: [ColorService],
})
export class ColorModule {}

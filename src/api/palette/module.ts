// import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PaletteController } from './controller';
import { PaletteService } from './service';
import { DbModule } from '../../services/db';

@Module({
  imports: [DbModule],
  controllers: [PaletteController],
  providers: [PaletteService],
})
export class PaletteModule {}

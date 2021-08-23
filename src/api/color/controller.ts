import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ColorService } from './service';

@ApiTags('colors')
@Controller()
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Get('/colors')
  async findColors(@Query('static') isStatic: boolean | null) {
    return await this.colorService.findAll(isStatic || null);
  }

  @Post('/color')
  async addColor(@Body('rgb') rgb: string) {
    return await this.colorService.store(rgb);
  }

  @Delete('/color/:id')
  async removeColor(@Param() params) {
    return await this.colorService.delete(Number(params.id));
  }

  @Get('/colors/:paletteId')
  async findAllColorsByPalette(@Param() params) {
    return await this.colorService.findAllColorsByPalette(
      Number(params.paletteId),
    );
  }
}

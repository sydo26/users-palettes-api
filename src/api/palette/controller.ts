import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaletteService } from './service';

@ApiTags('palettes')
@Controller()
export class PaletteController {
  constructor(private readonly paletteService: PaletteService) {}

  @Get('palettes')
  async findPalettes() {
    return await this.paletteService.findAll(null);
  }

  @Get('palettes/:colorId')
  async findPalettesByColor(@Param() params) {
    return await this.paletteService.findAll(Number(params.colorId));
  }

  @Post('palette')
  async addPalette(
    @Body('name') name: string,
    @Body('colors') colors: number[],
  ) {
    return await this.paletteService.store(name, colors);
  }

  @Delete('palette/:id')
  async deletePalette(@Param() params) {
    return await this.paletteService.delete(Number(params.id));
  }

  @Put('palette/:id')
  async updateColorsInPalette(
    @Param() params,
    @Body('colors') colors: number[],
  ) {
    return await this.paletteService.updateColors(Number(params.id), colors);
  }

  @Post('palette/:id/color')
  async addColor(@Param() params, @Body('codeColor') codeColor: number) {
    return await this.paletteService.addColorInPalette(
      Number(params.id),
      codeColor,
    );
  }

  @Delete('palette/:id/color')
  async removeColor(@Param() params, @Body('codeColor') codeColor: number) {
    return await this.paletteService.removeColorOfPalette(
      Number(params.id),
      codeColor,
    );
  }
}

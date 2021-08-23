import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entity';
import { UserService } from './service';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/users')
  async findUsers() {
    return (await this.userService.findAll()).map((x) => {
      delete x.password;
      return x;
    });
  }

  @Get('/user/:id')
  async findUser(@Param() params) {
    const data = await this.userService.find(Number(params.id));
    delete data.password;
    return data;
  }

  @Post('/user')
  async addUser(
    @Body('fullName') fullName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const userEntityData = new UserEntity(fullName, email, password);
    await userEntityData.hashPassword();
    return await this.userService.store(userEntityData);
  }

  @Put('/user/:id')
  async updateUser(
    @Param() params,
    @Body('fullName') fullName: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('oldPassword') oldPassword: string,
  ) {
    const userEntityUpdateData = new UserEntity(
      fullName,
      email,
      password,
      oldPassword,
    );

    const userData = await this.userService.find(Number(params.id));

    if (!userData)
      return {
        message: 'Usuário inexistente',
      };

    const oldPasswordIsValid = await userEntityUpdateData.validOldPassword(
      userData.password,
    );

    if (oldPasswordIsValid || !password) {
      await userEntityUpdateData.hashPassword();
      return await this.userService.update(
        Number(params.id),
        userEntityUpdateData,
      );
    }

    return {
      message: 'Senha antiga incorreta!',
    };
  }

  @Delete('/user/:id')
  async deleteUser(@Param() params) {
    const data = await this.userService.delete(Number(params.id));
    delete data.password;
    return data;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/me/palette/:codePalette')
  async savePalette(@Request() req, @Param() params) {
    return await this.userService.savePalette(
      Number(req.user.code),
      Number(params.codePalette),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me/palettes')
  async findPalettes(@Request() req) {
    return await this.userService.findAllPalettes(Number(req.user.code));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  async findMe(@Request() req) {
    const data = await this.userService.find(req.user.code);
    delete data.password;
    return data;
  }
}

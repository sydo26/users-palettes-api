import { Param } from '@nestjs/common';
import { Put } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/users')
  async findUsers() {
    const data = (await this.userService.findAll()).map((x) => {
      delete x.password;
      return x;
    });
    return data;
  }

  @Get('/user/:id')
  async findUser(@Param() params) {
    return await this.userService.find(Number(params.id));
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
      userEntityUpdateData.hashPassword();
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
    return await this.userService.delete(Number(params.id));
  }
}

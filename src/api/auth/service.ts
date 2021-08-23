import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async authenticate(
    email: string,
    password: string,
  ): Promise<{ code: number; email: string }> {
    const user = await this.userService.findOneByEmail(email);
    const passwordHash = user.password;
    user.password = password;
    if (await user.validPassword(passwordHash)) {
      return { code: user.code, email: user.email };
    }

    return null;
  }

  async login(code: number, email: string): Promise<{ accessToken: string }> {
    const payload = {
      email,
      sub: code,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

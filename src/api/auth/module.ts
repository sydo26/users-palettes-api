import { Module } from '@nestjs/common';
import { AuthService } from './service';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

const MyJwtModule = JwtModule.register({
  secret: 'asktokw12jt12jt12g09kf09k1290fk290k0912kt',
  signOptions: {
    expiresIn: '1000s',
  },
});

@Module({
  imports: [UserModule, PassportModule, MyJwtModule],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

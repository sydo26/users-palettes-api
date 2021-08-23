import * as argon2 from 'argon2';

export class UserEntity {
  code: number;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  oldPassword: string;

  constructor(fullName = '', email = '', password = '', oldPassword = '') {
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.oldPassword = oldPassword;
  }

  async validOldPassword(hash: string) {
    if (!this.oldPassword || !hash) return false;
    return await argon2.verify(hash, this.oldPassword);
  }

  async validPassword(hash: string) {
    if (!this.password || !hash) return false;
    return await argon2.verify(hash, this.password);
  }

  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}

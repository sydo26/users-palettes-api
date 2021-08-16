import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(@Inject('PG_CONNECTION') private con: Pool) {}

  async findAll(): Promise<UserEntity[]> {
    return (
      await this.con.query<UserEntity>(
        'SELECT code, password, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt" FROM users',
      )
    ).rows;
  }

  async find(identification: number): Promise<UserEntity> {
    return await this.con
      .query<UserEntity>(
        `SELECT code, password, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt" FROM users WHERE code=$1`,
        [identification],
      )
      .then((res) => {
        return res.rows[0];
      })
      .catch((err) => {
        return err;
      });
  }

  async store(userEntity: UserEntity): Promise<UserEntity> {
    return await this.con
      .query<UserEntity>(
        `INSERT INTO users(fullName, email, password) VALUES($1, $2, $3)
         RETURNING code, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt"`,
        [userEntity.fullName, userEntity.email, userEntity.password],
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => {
        return err;
      });
  }

  async update(identification: number, data: UserEntity): Promise<UserEntity> {
    const values = [
      data.email && `email='${data.email}'`,
      data.fullName && `fullname='${data.fullName}'`,
      data.password && `password='${data.password}'`,
    ];

    return await this.con
      .query<UserEntity>(
        `UPDATE USERS SET ${values
          .filter((x) => x.length > 0)
          .join(
            ',',
          )} WHERE code=$1 RETURNING code, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt"`,
        [identification],
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => {
        return {
          ...err,
          values,
        };
      });
  }

  async delete(identification: number): Promise<UserEntity> {
    return await this.con
      .query(`DELETE FROM users WHERE code=$1`, [identification])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }
}

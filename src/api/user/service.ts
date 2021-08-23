import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { UserEntity } from './entity';

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

  async findOneByEmail(email: string): Promise<UserEntity> {
    return await this.con
      .query<UserEntity>(
        'SELECT code, password, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt" FROM users WHERE email=$1',
        [email],
      )
      .then((res) => {
        const data = res.rows[0];
        const entity = new UserEntity(data.fullName, data.email, data.password);
        entity.code = data.code;

        return entity;
      })
      .catch((err) => err);
  }

  async savePalette(identification: number, paletteCode: number) {
    const data = await this.con
      .query(
        'SELECT * FROM users_palettes WHERE codeUser=$1 AND codePalette=$2',
        [identification, paletteCode],
      )
      .then((res) => res.rowCount);

    if (data > 0)
      return {
        message: 'Esta paleta de cor já está salva.',
      };

    return await this.con
      .query(
        `INSERT INTO users_palettes(codeUser, codePalette) VALUES ($1, $2) RETURNING *`,
        [identification, paletteCode],
      )
      .then((res) => {
        if (res.rowCount === 0)
          return {
            message:
              'Não foi possível salvar a paleta de cores para o usuário.',
          };
        return {
          message: 'A paleta foi salva pelo usuário',
        };
      })
      .catch((err) => err);
  }

  async find(identification: number): Promise<UserEntity> {
    return await this.con
      .query<UserEntity>(
        `SELECT code, password, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt" FROM users WHERE code=$1`,
        [identification],
      )
      .then((res) => {
        if (res.rowCount === 0)
          return {
            message:
              'Nenhum usuário com id ' + identification + ' foi encontrado.',
          };

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

  async delete(identification: number) {
    return await this.con
      .query(
        `DELETE FROM users WHERE code=$1 RETURNING code, password, fullname as "fullName", email, createdat as "createdAt", updatedat as "updatedAt"`,
        [identification],
      )
      .then((res) => {
        if (res.rowCount === 0) {
          return {
            message: 'O usuário não existe.',
          };
        }
        return {
          data: res.rows[0],
          message: 'O usuário foi deletado com sucesso!',
        };
      })
      .catch((err) => {
        return err;
      });
  }

  async findAllPalettes(identification: number) {
    return await this.con
      .query(
        'SELECT p.code, p.name, p.amount, p.createdAt as "createdAt", p.updatedAt as "updatedAt" FROM PALETTES p INNER JOIN users_palettes as up ON up.codeuser=$1 WHERE p.code = up.codepalette',
        [identification],
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => err);
  }
}

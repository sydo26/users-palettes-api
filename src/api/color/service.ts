import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class ColorService {
  constructor(@Inject('PG_CONNECTION') private con: Pool) {}

  async findAll(isStatic: boolean | null = null) {
    return await this.con
      .query(
        `SELECT code, name, rgb, static, createdat as "createdAt" FROM COLORS ${
          isStatic ? `WHERE static=${isStatic}` : ''
        }`,
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => err);
  }

  async store(rgb: string) {
    return await this.con
      .query(
        `
      INSERT INTO COLORS(rgb) VALUES($1) RETURNING *
    `,
        [rgb],
      )
      .then((res) => {
        if (res.rowCount === 0) {
          return {
            message: 'Não foi possível adicionar a cor ' + rgb,
          };
        }

        return res.rows[0];
      })
      .catch((err) => err);
  }

  async delete(identification: number) {
    return await this.con
      .query(`DELETE FROM COLORS WHERE code=$1 AND static=false`, [
        identification,
      ])
      .then((res) => {
        if (res.rowCount === 0) {
          return {
            message: 'Não foi possível alterar essa cor.',
          };
        }

        return {
          message: 'Cor deletada com sucesso!',
        };
      })
      .catch((err) => err);
  }

  async findAllColorsByPalette(codePalette: number) {
    return await this.con
      .query(
        'SELECT c.code, c.static, c.name, c.rgb, c.createdAt as "createdAt" FROM COLORS as c INNER JOIN COLORS_PALETTES as cp ON cp.codepalette=$1 WHERE c.code = cp.codecolor',
        [codePalette],
      )
      .then((res) => res.rows)
      .catch((err) => err);
  }
}

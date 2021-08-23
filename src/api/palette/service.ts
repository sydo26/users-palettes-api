import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PaletteService {
  constructor(@Inject('PG_CONNECTION') private con: Pool) {}

  async findAll(byColor: number) {
    return await this.con
      .query(
        `SELECT p.code, p.name, p.amount, p.createdat as "createdAt", p.updatedat as "updatedAt" FROM palettes as p ${
          byColor
            ? `INNER JOIN colors_palettes as cp ON cp.codecolor = ${byColor} WHERE p.code = cp.codepalette`
            : ''
        }`,
      )
      .then((res) => res.rows)
      .catch((err) => err);
  }

  async store(name: string, colors: number[]) {
    return await this.con
      .query(
        `INSERT INTO palettes(name) VALUES($1) RETURNING code, name, amount, createdat as "createdAt", updatedat as "updatedAt"`,
        [name],
      )
      .then(async (res) => {
        const palette = res.rows[0];
        const queryStr = `INSERT INTO colors_palettes(codePalette, codeColor) VALUES${colors
          .map((x) => `(${palette.code}, ${x})`)
          .join(
            ',',
          )} RETURNING codeColor as code, (SELECT name FROM COLORS WHERE code=codeColor) as name, (SELECT rgb FROM COLORS WHERE code=codeColor) as rgb`;
        return await this.con
          .query(queryStr)
          .then((res2) => {
            return {
              ...palette,
              colors: res2.rows,
            };
          })
          .catch((err2) => {
            return {
              ...palette,
              colors: err2,
            };
          });
      })
      .catch((err) => {
        return err;
      });
  }

  async updateColors(code: number, colors: number[]) {
    if (colors) {
      return await this.con
        .query(`DELETE FROM colors_palettes WHERE codePalette=$1`, [code])
        .then(async () => {
          return await this.con
            .query(
              `INSERT INTO colors_palettes(codePalette, codeColor) VALUES ${colors
                .map((x) => `(${code}, ${x})`)
                .join(', ')}`,
            )
            .then(() => {
              return {
                message:
                  'Paleta de cores atualizada com sucesso para as cores: ' +
                  colors.join(', '),
              };
            })
            .catch((err) => err);
        })
        .catch((err) => err);
    }

    return {
      message: 'Informe alguma as cores da paleta de cor.',
    };
  }

  async delete(code: number) {
    return await this.con
      .query('DELETE FROM palettes WHERE code=$1 RETURNING *', [code])
      .then((res) => {
        if (res.rowCount === 0) {
          return {
            message:
              'Nenhuma paleta de cores com id ' + code + ' foi encontrada',
          };
        }
        return {
          data: res.rows[0],
          message: 'Paleta de cores deletada com sucesso',
        };
      })
      .catch((res) => res);
  }

  async addColorInPalette(code: number, codeColor: number) {
    return await this.con
      .query('SELECT * FROM colors_palettes WHERE code=$1 AND codeColor=$2', [
        code,
        codeColor,
      ])
      .then(async (res) => {
        if (res.rowCount === 0) {
          return await this.con
            .query(
              'INSERT INTO colors_palettes(codePalette, codeColor) VALUES ($1, $2)',
              [code, codeColor],
            )
            .then(() => {
              return {
                message: 'A cor foi adicionada com sucesso!',
              };
            })
            .catch((err) => err);
        }

        return {
          message: 'Esta cor já está adicionada na paleta.',
        };
      })
      .catch((err) => err);
  }

  async removeColorOfPalette(code: number, codeColor: number) {
    return await this.con
      .query(
        'DELETE FROM colors_palettes WHERE codePalette=$1 AND codeColor=$2 RETURNING *',
        [code, codeColor],
      )
      .then((res) => {
        if (res.rowCount === 0) {
          return {
            message: 'Esta cor não está adicionada nesta paleta de cores.',
          };
        }

        return {
          data: res.rows[0],
          message: 'A cor foi removida com sucesso da paleta de cores',
        };
      });
  }
}

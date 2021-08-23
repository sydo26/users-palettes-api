import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';

export const dataBaseProvider = {
  provide: 'PG_CONNECTION',
  useValue: new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PASSWORD),
  }),
};

export const getSetupQuery = async () => {
  return await (
    await fs.readFile(
      path.resolve(__dirname, '..', '..', 'assets', 'setup.sql'),
    )
  ).toString('utf-8');
};

@Module({
  providers: [dataBaseProvider],
  exports: [dataBaseProvider],
})
export class DbModule {}

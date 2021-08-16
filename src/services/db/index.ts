import { Module } from '@nestjs/common';
import pg, { Pool } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as logger from 'bunyan';

export const dataBaseProvider = {
  provide: 'PG_CONNECTION',
  useValue: new Pool({
    user: 'root',
    host: '127.0.0.1',
    database: 'mypalettes',
    password: 'root',
    port: 5432,
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

import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { getSetupQuery } from '../services/db';

@Controller()
export class AppController {
  constructor(@Inject('PG_CONNECTION') private con: Pool) {}

  @Get()
  getHello(): string {
    return 'api';
  }

  @Get('setup')
  async setup() {
    const query = await getSetupQuery();
    return await this.con.query(query);
  }
}

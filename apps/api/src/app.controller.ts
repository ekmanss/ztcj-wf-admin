import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common'
import { type Pool } from 'mysql2/promise'
import { DB_POOL } from './db/db.constants'

@Controller('health')
export class AppController {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  @Get()
  async health() {
    try {
      await this.pool.query('SELECT 1')
    } catch {
      throw new ServiceUnavailableException({
        statusCode: 503,
        status: 'error',
        checks: { database: 'error' },
        message: 'Database is unavailable.',
      })
    }

    return { status: 'ok', checks: { database: 'ok' } }
  }
}

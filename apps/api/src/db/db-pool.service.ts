import { Injectable, type OnApplicationShutdown } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import mysql, { type Pool } from 'mysql2/promise'

@Injectable()
export class DbPoolService implements OnApplicationShutdown {
  private readonly pool: Pool

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL')

    if (!connectionString) {
      throw new Error('DATABASE_URL is required to start the API server.')
    }

    this.pool = mysql.createPool(connectionString)
  }

  getPool() {
    return this.pool
  }

  async onApplicationShutdown() {
    await this.pool.end()
  }
}

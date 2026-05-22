import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql, { type Pool } from 'mysql2/promise'
import { DB, DB_POOL } from './db.constants'
import * as schema from './schema'

@Module({
  providers: [
    {
      provide: DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('DATABASE_URL')

        if (!connectionString) {
          throw new Error('DATABASE_URL is required to start the API server.')
        }

        return mysql.createPool(connectionString)
      },
    },
    {
      provide: DB,
      inject: [DB_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema, mode: 'default' }),
    },
  ],
  exports: [DB, DB_POOL],
})
export class DbModule {}

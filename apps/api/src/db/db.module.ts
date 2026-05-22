import { Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/mysql2'
import { type Pool } from 'mysql2/promise'
import { DB, DB_POOL } from './db.constants'
import { DbPoolService } from './db-pool.service'
import * as schema from './schema'

@Module({
  providers: [
    DbPoolService,
    {
      provide: DB_POOL,
      inject: [DbPoolService],
      useFactory: (dbPool: DbPoolService) => dbPool.getPool(),
    },
    {
      provide: DB,
      inject: [DB_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema, mode: 'default' }),
    },
  ],
  exports: [DB, DB_POOL, DbPoolService],
})
export class DbModule {}

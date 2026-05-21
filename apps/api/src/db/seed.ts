import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users } from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database.')
}

const pool = new Pool({ connectionString })
const db = drizzle(pool)

async function seed() {
  await db
    .insert(users)
    .values([
      {
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@example.com',
        phoneNumber: '+10000000000',
        status: 'active',
        role: 'superadmin',
      },
      {
        firstName: 'Demo',
        lastName: 'Manager',
        username: 'demo_manager',
        email: 'manager@example.com',
        phoneNumber: '+10000000001',
        status: 'invited',
        role: 'manager',
      },
    ])
    .onConflictDoNothing()
}

seed()
  .then(async () => {
    await pool.end()
  })
  .catch(async (error: unknown) => {
    process.stderr.write(`${String(error)}\n`)
    await pool.end()
    process.exitCode = 1
  })

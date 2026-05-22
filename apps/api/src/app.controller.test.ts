import { ServiceUnavailableException } from '@nestjs/common'
import { type Pool } from 'mysql2/promise'
import { describe, expect, it, vi } from 'vitest'
import { AppController } from './app.controller'

function createController(query: Pool['query']) {
  const pool = { query } as unknown as Pool
  return new AppController(pool)
}

describe('AppController', () => {
  it('reports ok only after the database responds', async () => {
    const query = vi.fn().mockResolvedValue([[], []])
    const controller = createController(query as Pool['query'])

    await expect(controller.health()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'ok' },
    })
    expect(query).toHaveBeenCalledWith('SELECT 1')
  })

  it('reports service unavailable when the database check fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('connection failed'))
    const controller = createController(query as Pool['query'])

    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException
    )
  })
})

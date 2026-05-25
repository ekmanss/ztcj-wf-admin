import { DrizzleQueryError } from 'drizzle-orm/errors'
import { describe, expect, it } from 'vitest'
import { isDatabaseUnavailableError } from './database-exception.filter'

function queryError(cause: Error & { code?: string; sqlState?: string }) {
  return new DrizzleQueryError('select 1', [], cause)
}

describe('isDatabaseUnavailableError', () => {
  it('detects MySQL connection failures', () => {
    expect(
      isDatabaseUnavailableError(
        queryError(
          Object.assign(new Error('refused'), { code: 'ECONNREFUSED' })
        )
      )
    ).toBe(true)
  })

  it('detects MySQL server shutdown errors', () => {
    expect(
      isDatabaseUnavailableError(
        queryError(
          Object.assign(new Error('Server shutdown in progress'), {
            code: 'ER_SERVER_SHUTDOWN',
            sqlState: '08S01',
          })
        )
      )
    ).toBe(true)
  })

  it('keeps other query failures as non-connectivity errors', () => {
    expect(
      isDatabaseUnavailableError(
        queryError(
          Object.assign(new Error('bad SQL'), { code: 'ER_BAD_FIELD_ERROR' })
        )
      )
    ).toBe(false)
  })
})

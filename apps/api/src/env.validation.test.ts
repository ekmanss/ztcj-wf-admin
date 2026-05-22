import { describe, expect, it } from 'vitest'
import { validateApiEnv } from './env.validation'

describe('validateApiEnv', () => {
  it('returns normalized required API config with a default port', () => {
    expect(
      validateApiEnv({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/app',
      })
    ).toMatchObject({
      DATABASE_URL: 'mysql://user:pass@localhost:3306/app',
      PORT: 3001,
    })
  })

  it('keeps CORS_ORIGIN optional', () => {
    expect(
      validateApiEnv({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/app',
        PORT: '4000',
      })
    ).not.toHaveProperty('CORS_ORIGIN')
  })

  it('fails fast when required config is missing or invalid', () => {
    expect(() => validateApiEnv({ PORT: 'bad-port' })).toThrow(
      /DATABASE_URL is required/
    )
    expect(() =>
      validateApiEnv({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/app',
        PORT: '70000',
      })
    ).toThrow(/PORT must be an integer/)
  })
})

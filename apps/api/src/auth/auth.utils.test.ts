import { describe, expect, it } from 'vitest'
import {
  encryptLegacyPassword,
  extractAuthToken,
  resolveAccountColumn,
  verifyLegacyPassword,
} from './auth.utils'

describe('auth utils', () => {
  it('matches the legacy FastAdmin password hash format', () => {
    const hash = encryptLegacyPassword('123456', 'abc')

    expect(hash).toBe('322d3fef02fc39251436cb4522d29a71')
    expect(verifyLegacyPassword('123456', 'abc', hash)).toBe(true)
    expect(verifyLegacyPassword('bad-password', 'abc', hash)).toBe(false)
  })

  it('resolves account columns with the old login rules', () => {
    expect(resolveAccountColumn('user@example.com')).toBe('email')
    expect(resolveAccountColumn('13800138000')).toBe('mobile')
    expect(resolveAccountColumn('admin')).toBe('username')
  })

  it('extracts bearer tokens and falls back to the legacy token header', () => {
    expect(extractAuthToken('Bearer abc123')).toBe('abc123')
    expect(extractAuthToken(undefined, 'legacy-token')).toBe('legacy-token')
    expect(extractAuthToken(undefined, ['first', 'second'])).toBe('first')
    expect(extractAuthToken()).toBe('')
  })
})

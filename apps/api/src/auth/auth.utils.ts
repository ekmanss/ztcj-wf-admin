import { createHash, timingSafeEqual } from 'node:crypto'

export type AccountColumn = 'email' | 'mobile' | 'username'

function md5(value: string) {
  return createHash('md5').update(value).digest('hex')
}

function safeCompare(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest()
  const rightHash = createHash('sha256').update(right).digest()

  return timingSafeEqual(leftHash, rightHash)
}

export function encryptLegacyPassword(password: string, salt: string) {
  return md5(`${md5(password)}${salt}`)
}

export function verifyLegacyPassword(
  password: string,
  salt: string,
  expectedHash: string
) {
  return safeCompare(encryptLegacyPassword(password, salt), expectedHash)
}

export function resolveAccountColumn(account: string): AccountColumn {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) return 'email'
  if (/^1\d{10}$/.test(account)) return 'mobile'

  return 'username'
}

export function extractAuthToken(
  authorization?: string,
  tokenHeader?: string | string[]
) {
  const bearerPrefix = 'Bearer '

  if (authorization?.startsWith(bearerPrefix)) {
    return authorization.slice(bearerPrefix.length).trim()
  }

  const rawToken = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader
  return rawToken?.trim() ?? ''
}

export function toUnixSeconds(date = new Date()) {
  return Math.floor(date.getTime() / 1000)
}

export function getDayStartUnixSeconds(timestamp = toUnixSeconds()) {
  const date = new Date(timestamp * 1000)
  date.setHours(0, 0, 0, 0)

  return toUnixSeconds(date)
}

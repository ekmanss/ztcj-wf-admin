type ApiEnv = Record<string, unknown> & {
  DATABASE_URL: string
  PORT: number
  CORS_ORIGIN?: string
}

function toOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function parsePort(value: unknown) {
  const rawValue = value ?? '3001'
  const port = typeof rawValue === 'number' ? rawValue : Number(rawValue)

  return Number.isInteger(port) && port >= 0 && port <= 65535 ? port : undefined
}

export function validateApiEnv(config: Record<string, unknown>): ApiEnv {
  const {
    CORS_ORIGIN: _rawCorsOrigin,
    DATABASE_URL: _rawDatabaseUrl,
    PORT: _rawPort,
    ...restConfig
  } = config
  const errors: string[] = []
  const databaseUrl = toOptionalString(config.DATABASE_URL)
  const port = parsePort(config.PORT)
  const corsOrigin = toOptionalString(config.CORS_ORIGIN)

  if (!databaseUrl) {
    errors.push('DATABASE_URL is required.')
  }

  if (port === undefined) {
    errors.push('PORT must be an integer between 0 and 65535.')
  }

  if (errors.length > 0 || !databaseUrl || port === undefined) {
    throw new Error(`Invalid API configuration:\n- ${errors.join('\n- ')}`)
  }

  return {
    ...restConfig,
    DATABASE_URL: databaseUrl,
    PORT: port,
    ...(corsOrigin ? { CORS_ORIGIN: corsOrigin } : {}),
  }
}

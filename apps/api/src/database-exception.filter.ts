import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { DrizzleQueryError } from 'drizzle-orm/errors'

const DATABASE_UNAVAILABLE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'ER_SERVER_SHUTDOWN',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
])

type ErrorWithCode = Error & {
  code?: string
  errno?: number
  sqlState?: string
}

type JsonResponse = {
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => unknown
  }
}

function getErrorCause(error: DrizzleQueryError) {
  return error.cause as ErrorWithCode | undefined
}

export function isDatabaseUnavailableError(error: unknown) {
  if (!(error instanceof DrizzleQueryError)) return false

  const cause = getErrorCause(error)
  const code = cause?.code

  return (
    (code ? DATABASE_UNAVAILABLE_CODES.has(code) : false) ||
    cause?.sqlState === '08S01'
  )
}

@Catch(DrizzleQueryError)
export class DatabaseExceptionFilter implements ExceptionFilter<DrizzleQueryError> {
  private readonly logger = new Logger(DatabaseExceptionFilter.name)

  catch(exception: DrizzleQueryError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<JsonResponse>()
    const cause = getErrorCause(exception)
    const isUnavailable = isDatabaseUnavailableError(exception)
    const statusCode = isUnavailable
      ? HttpStatus.SERVICE_UNAVAILABLE
      : HttpStatus.INTERNAL_SERVER_ERROR
    const message = isUnavailable
      ? '数据库暂不可用，请稍后重试。'
      : '数据库查询失败。'

    this.logger.error(
      `${message} ${cause?.code ?? cause?.message ?? exception.message}`
    )

    return response.status(statusCode).json({
      statusCode,
      message,
      error: isUnavailable ? 'Service Unavailable' : 'Internal Server Error',
    })
  }
}

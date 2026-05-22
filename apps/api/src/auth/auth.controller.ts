import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common'
import { LoginDto } from './auth.dto'
import { AuthService } from './auth.service'
import { extractAuthToken } from './auth.utils'

type RequestLike = {
  ip?: string
  socket?: {
    remoteAddress?: string
  }
  headers: Record<string, string | string[] | undefined>
}

function getClientIp(request: RequestLike) {
  const forwardedFor = request.headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]

  return (
    forwardedIp?.trim() ||
    request.ip ||
    request.socket?.remoteAddress ||
    ''
  ).slice(0, 50)
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: RequestLike) {
    return this.authService.login(dto, getClientIp(request))
  }

  @Get('me')
  me(
    @Headers('authorization') authorization?: string,
    @Headers('token') tokenHeader?: string | string[]
  ) {
    return this.authService.me(extractAuthToken(authorization, tokenHeader))
  }

  @Post('logout')
  logout(
    @Headers('authorization') authorization?: string,
    @Headers('token') tokenHeader?: string | string[]
  ) {
    return this.authService.logout(extractAuthToken(authorization, tokenHeader))
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

/**
 * Telefon + Telegram Gateway OTP (rasmiy Verification Codes).
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-code')
  requestCode(@Body() dto: RequestCodeDto) {
    return this.authService.requestCode(dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }
}

import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: unknown) {
    return this.authService.login(body);
  }

  // Cambio obligatorio de contraseña en el primer ingreso
  @Post('change-initial-password')
  changeInitialPassword(
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.authService.changeInitialPassword(body, authorization);
  }

  @Get('profile')
  profile(@Headers('authorization') authorization: string) {
    return this.authService.profile(authorization);
  }
}

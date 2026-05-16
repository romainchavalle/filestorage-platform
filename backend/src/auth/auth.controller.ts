import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UserLoginSchema, UserRegisterSchema } from 'shared';
import type { UserLoginDto, UserRegisterDto } from 'shared';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body(new ZodValidationPipe(UserRegisterSchema)) body: UserRegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  @Public()
  @Post('login')
  async login(@Body(new ZodValidationPipe(UserLoginSchema)) body: UserLoginDto) {
    return this.authService.login(body.email, body.password);
  }
}

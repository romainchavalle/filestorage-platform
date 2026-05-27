import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UserLoginSchema, UserRegisterSchema } from 'shared';
import type { UserLoginDto, UserRegisterDto, LoginResponseDto, RegisterResponseDto } from 'shared';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(UserRegisterSchema))
  async register(@Body() dto: UserRegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto.email, dto.password);
  }

  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(UserLoginSchema))
  async login(@Body() dto: UserLoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }
}

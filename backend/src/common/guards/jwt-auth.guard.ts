import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // Appelé AVANT chaque route protégée
  canActivate(context: ExecutionContext) {
    // Vérifie si la route a le décorateur @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si @Public() → on laisse passer sans vérifier le token
    if (isPublic) {
      return true;
    }

    // Sinon → on vérifie le token via la JwtStrategy
    return super.canActivate(context);
  }
}

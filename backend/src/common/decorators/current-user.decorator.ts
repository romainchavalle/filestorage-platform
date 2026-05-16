import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Décorateur @CurrentUser() — raccourci pour récupérer le userId dans un controller
// Au lieu de : request.user.userId
// On écrit :  @CurrentUser() userId: string
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);

import { SetMetadata } from '@nestjs/common';

// Clé utilisée pour marquer une route comme publique
export const IS_PUBLIC_KEY = 'isPublic';

// Décorateur @Public() — à mettre sur les routes qui ne nécessitent pas de token
// Exemple : @Public() @Post('login')
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

import { z } from 'zod';

// Exemple de schéma partagé (à étendre)
export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type UserLoginDto = z.infer<typeof UserLoginSchema>;

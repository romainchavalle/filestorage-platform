import { z } from 'zod';

// POST /api/auth/login
export const UserLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
});

// POST /api/auth/register
export const UserRegisterSchema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// Types inférés automatiquement (Entrées)
export type UserLoginDto = z.infer<typeof UserLoginSchema>;
export type UserRegisterDto = z.infer<typeof UserRegisterSchema>;

// Réponses (Sorties)
export const LoginResponseSchema = z.object({
  access_token: z.string(),
});

export const RegisterResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

// Types inférés (Sorties)
export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;
export type RegisterResponseDto = z.infer<typeof RegisterResponseSchema>;

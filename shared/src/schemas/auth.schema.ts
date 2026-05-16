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

// Types inférés automatiquement
export type UserLoginDto = z.infer<typeof UserLoginSchema>;
export type UserRegisterDto = z.infer<typeof UserRegisterSchema>;

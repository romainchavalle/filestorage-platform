import client from '../../api/client';
import type { LoginResponseDto, RegisterResponseDto } from 'shared';

// POST /auth/login → { access_token: "eyJ..." }
export async function loginApi(email: string, password: string) {
  const response = await client.post<LoginResponseDto>('/auth/login', { email, password });
  return response.data;
}

// POST /auth/register → { id: "abc-123", email: "romain@test.com" }
export async function registerApi(email: string, password: string, confirmPassword: string) {
  const response = await client.post<RegisterResponseDto>('/auth/register', { email, password, confirmPassword });
  return response.data;
}

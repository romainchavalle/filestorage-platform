import client from '../../api/client';

// POST /auth/login → { access_token: "eyJ..." }
export async function loginApi(email: string, password: string) {
  const response = await client.post('/auth/login', { email, password });
  return response.data as { access_token: string };
}

// POST /auth/register → { id: "abc-123", email: "romain@test.com" }
export async function registerApi(email: string, password: string, confirmPassword: string) {
  const response = await client.post('/auth/register', { email, password, confirmPassword });
  return response.data as { id: string; email: string };
}

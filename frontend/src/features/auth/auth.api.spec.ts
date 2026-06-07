import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginApi, registerApi } from './auth.api';
import client from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginApi appelle POST /auth/login avec les bons paramètres', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { access_token: 'token123' } });
    
    const result = await loginApi('test@test.com', 'password123');
    
    expect(client.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password123' });
    expect(result).toEqual({ access_token: 'token123' });
  });

  it('registerApi appelle POST /auth/register', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1', email: 'test@test.com' } });
    
    const result = await registerApi('test@test.com', 'pass', 'pass');
    
    expect(client.post).toHaveBeenCalledWith('/auth/register', { email: 'test@test.com', password: 'pass', confirmPassword: 'pass' });
    expect(result).toEqual({ id: '1', email: 'test@test.com' });
  });
});

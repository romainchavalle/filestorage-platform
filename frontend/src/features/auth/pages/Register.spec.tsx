import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Register } from './Register';
import * as authApi from '../auth.api';
import { useAuthStore } from '../useAuthStore';

vi.mock('../auth.api', () => ({
  registerApi: vi.fn(),
  loginApi: vi.fn(),
}));

const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

describe('Register Component (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isAuthenticated: false, token: null });
  });

  it('affiche des erreurs Zod si les mots de passe ne correspondent pas', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Saisissez votre email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Saisissez votre mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Saisissez-le à nouveau/i), { target: { value: 'diff-password' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    expect(await screen.findByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
  });

  it('affiche une erreur si l API renvoie que l email est deja utilisé', async () => {
    vi.mocked(authApi.registerApi).mockRejectedValue(new Error('Conflict'));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Saisissez votre email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Saisissez votre mot de passe/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Saisissez-le à nouveau/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    expect(await screen.findByText('Cet email est déjà utilisé')).toBeInTheDocument();
  });

  it('inscrit, connecte et redirige en cas de succes', async () => {
    vi.mocked(authApi.registerApi).mockResolvedValue(undefined as any);
    vi.mocked(authApi.loginApi).mockResolvedValue({ access_token: 'fake-token-456' });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Saisissez votre email/i), { target: { value: 'pro@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Saisissez votre mot de passe/i), { target: { value: 'superpassword123' } });
    fireEvent.change(screen.getByPlaceholderText(/Saisissez-le à nouveau/i), { target: { value: 'superpassword123' } });

    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    await waitFor(() => {
      expect(authApi.registerApi).toHaveBeenCalledWith('pro@test.com', 'superpassword123', 'superpassword123');
      expect(authApi.loginApi).toHaveBeenCalledWith('pro@test.com', 'superpassword123');
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

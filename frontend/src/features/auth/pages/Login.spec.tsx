import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from './Login';
import * as authApi from '../auth.api';
import { useAuthStore } from '../useAuthStore';

// On intercepte ("mock") tout le fichier auth.api pour ne pas faire de vraies requêtes HTTP
vi.mock('../auth.api', () => ({
  loginApi: vi.fn(),
}));

// On intercepte le router de React pour vérifier que navigate('/dashboard') est bien appelé
const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

describe('Login Component (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isAuthenticated: false, token: null });
  });

  it('affiche des erreurs de validation Zod si le formulaire est vide', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // L'utilisateur clique directement sur "Connexion" sans rien remplir
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }));

    // Zod doit hurler (de façon asynchrone, d'où le findByText)
    expect(await screen.findByText(/email invalide/i)).toBeInTheDocument();
  });

  it('affiche une erreur si l API renvoie une 401 (mauvais mot de passe)', async () => {
    // On force notre fausse API à planter
    vi.mocked(authApi.loginApi).mockRejectedValue(new Error('Unauthorized'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // On tape des identifiants
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'mauvaispass' },
    });

    // On soumet
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }));

    // On vérifie que notre composant affiche bien l'erreur rouge
    expect(await screen.findByText('Email ou mot de passe incorrect')).toBeInTheDocument();
  });

  it('connecte l utilisateur et redirige vers /dashboard en cas de succès', async () => {
    // On force notre fausse API à répondre avec un succès (200 OK)
    vi.mocked(authApi.loginApi).mockResolvedValue({ access_token: 'fake-token-123' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // On tape des identifiants valides
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), {
      target: { value: 'pro@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'superpassword123' },
    });

    // On soumet
    fireEvent.click(screen.getByRole('button', { name: /connexion/i }));

    // 1. Vérifier que la requête est partie avec les bons arguments
    await waitFor(() => {
      expect(authApi.loginApi).toHaveBeenCalledWith('pro@test.com', 'superpassword123');
    });

    // 2. Vérifier que le Zustand Store a bien stocké la session
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('fake-token-123');

    // 3. Vérifier qu'on a bien redirigé l'utilisateur
    expect(mockedUseNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

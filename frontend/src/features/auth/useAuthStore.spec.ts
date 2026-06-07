import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore (Unit Test)', () => {
  beforeEach(() => {
    // Nettoyer le localStorage et réinitialiser le state avant chaque test
    localStorage.clear();
    useAuthStore.setState({ token: null, isAuthenticated: false });
  });

  it('devrait initialiser sans token par défaut', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('devrait sauvegarder le token en mémoire et dans le localStorage lors du login()', () => {
    const fakeToken = 'mon-super-token-jwt';
    
    // Action
    useAuthStore.getState().login(fakeToken);

    // Vérifications
    const state = useAuthStore.getState();
    expect(state.token).toBe(fakeToken);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('access_token')).toBe(fakeToken);
  });

  it('devrait effacer le token en mémoire et dans le localStorage lors du logout()', () => {
    // Setup (on se connecte d abord)
    useAuthStore.getState().login('token-temporaire');
    
    // Action
    useAuthStore.getState().logout();

    // Vérifications
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});

import { create } from 'zustand';

// Définition du type du store (ce qu'il contient)
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ── État initial ─────────────────────────────────────────
  // Au démarrage (ou après un F5), on regarde si un token
  // existe dans localStorage pour restaurer la session
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  //               ^^ convertit string → true, null → false

  // ── Actions ──────────────────────────────────────────────
  login: (token) => {
    localStorage.setItem('access_token', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ token: null, isAuthenticated: false });
  },
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../features/auth/useAuthStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // On force l'utilisateur à être déconnecté par défaut
    useAuthStore.setState({ isAuthenticated: false });
  });

  it('redirige vers /login si l utilisateur nest pas connecté', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Page de Login</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Contenu Protégé</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // On s'attend à voir "Page de Login" et pas "Contenu Protégé"
    expect(screen.getByText('Page de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenu Protégé')).not.toBeInTheDocument();
  });

  it('affiche le contenu protégé si l utilisateur est connecté', () => {
    // On simule un utilisateur connecté
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Page de Login</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Contenu Protégé</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // On s'attend à voir le contenu de la page dashboard
    expect(screen.getByText('Contenu Protégé')).toBeInTheDocument();
    expect(screen.queryByText('Page de Login')).not.toBeInTheDocument();
  });
});

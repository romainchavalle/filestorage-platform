import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from './Dashboard';
import * as useDashboardHook from '../hooks/useDashboard';

// On mock le hook pour contrôler l'état du composant
vi.mock('../hooks/useDashboard', () => ({
  useDashboard: vi.fn(),
}));

describe('Dashboard Component (Integration)', () => {
  it('affiche un message si la liste de fichiers est vide', () => {
    vi.mocked(useDashboardHook.useDashboard).mockReturnValue({
      files: [],
      filter: 'all',
      setFilter: vi.fn(),
      isLoading: false,
      handleDeleteFile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Vous n'avez aucun fichier/i)).toBeInTheDocument();
  });

  it('affiche les fichiers quand il y en a', () => {
    vi.mocked(useDashboardHook.useDashboard).mockReturnValue({
      files: [
        {
          id: '1',
          original_name: 'document.pdf',
          mime_type: 'application/pdf',
          size_bytes: 1024,
          expires_at: new Date(Date.now() + 86400000 + 3600000).toISOString(), // demain avec buffer
          isProtected: false,
          created_at: new Date().toISOString(),
          status: 'ready',
          tags: []
        },
        {
          id: '2',
          original_name: 'image.png',
          mime_type: 'image/png',
          size_bytes: 2048,
          expires_at: new Date(Date.now() - 86400000).toISOString(), // hier (expiré)
          isProtected: true,
          created_at: new Date().toISOString(),
          status: 'ready',
          tags: []
        }
      ],
      filter: 'all',
      setFilter: vi.fn(),
      isLoading: false,
      handleDeleteFile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // On vérifie que les noms de fichiers sont dans le DOM
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('image.png')).toBeInTheDocument();

    // On vérifie les badges/textes d'expiration
    expect(screen.getByText(/Expire demain/i)).toBeInTheDocument();
  });
});

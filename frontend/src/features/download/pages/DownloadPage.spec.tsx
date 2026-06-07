import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DownloadPage } from './DownloadPage';
import * as downloadApi from '../download.api';

// On mock l'API de téléchargement
vi.mock('../download.api', () => ({
  downloadApi: {
    getPublicInfo: vi.fn(),
    getDownloadUrl: vi.fn(),
  }
}));

// On mock window.location.href
const originalLocation = window.location;
beforeEach(() => {
  vi.clearAllMocks();
  delete (window as any).location;
  window.location = { ...originalLocation, href: '' };
});

describe('DownloadPage Component (Integration)', () => {
  it('affiche une erreur 404 si le fichier n existe pas', async () => {
    vi.mocked(downloadApi.downloadApi.getPublicInfo).mockRejectedValue(new Error('Not Found'));

    render(
      <MemoryRouter initialEntries={['/d/uuid-123']}>
        <Routes>
          <Route path="/d/:id" element={<DownloadPage />} />
        </Routes>
      </MemoryRouter>
    );

    // L'erreur 404 s'affiche
    expect(await screen.findByText(/Ce fichier est introuvable/i)).toBeInTheDocument();
  });

  it('affiche les informations du fichier et déclenche le téléchargement', async () => {
    vi.mocked(downloadApi.downloadApi.getPublicInfo).mockResolvedValue({
      id: 'uuid-123',
      original_name: 'super_fichier.pdf',
      size_bytes: 1048576, // 1 Mo
      expires_at: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 jours
      isProtected: false,
    });

    vi.mocked(downloadApi.downloadApi.getDownloadUrl).mockResolvedValue({
      downloadUrl: 'http://s3.amazonaws.com/fake-url'
    });

    render(
      <MemoryRouter initialEntries={['/d/uuid-123']}>
        <Routes>
          <Route path="/d/:id" element={<DownloadPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Vérifie l'affichage du nom du fichier
    expect(await screen.findByText('super_fichier.pdf')).toBeInTheDocument();
    
    // Vérifie le formatage de la taille (1048576 = 1 Mo)
    expect(screen.getByText('1 Mo')).toBeInTheDocument();

    // Clique sur télécharger
    const downloadButton = screen.getByRole('button', { name: /Télécharger/i });
    fireEvent.click(downloadButton);

    // Vérifie que l'appel API a eu lieu
    await waitFor(() => {
      expect(downloadApi.downloadApi.getDownloadUrl).toHaveBeenCalledWith('uuid-123', { password: '' });
      expect(window.location.href).toBe('http://s3.amazonaws.com/fake-url');
    });
  });

  it('affiche une erreur de mot de passe invalide (403) et permet de retaper', async () => {
    vi.mocked(downloadApi.downloadApi.getPublicInfo).mockResolvedValue({
      id: 'uuid-123',
      original_name: 'super_fichier.pdf',
      size_bytes: 1048576,
      expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
      isProtected: true, // Protégé !
    });

    // On mock une erreur 403
    vi.mocked(downloadApi.downloadApi.getDownloadUrl).mockRejectedValue({
      response: { status: 403 }
    });

    render(
      <MemoryRouter initialEntries={['/d/uuid-123']}>
        <Routes>
          <Route path="/d/:id" element={<DownloadPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Le champ mot de passe doit être là
    const passwordInput = await screen.findByPlaceholderText(/Saisissez le mot de passe/i);
    
    // Tape un mauvais mot de passe
    fireEvent.change(passwordInput, { target: { value: 'bad_password' } });
    
    const downloadButton = screen.getByRole('button', { name: /Télécharger/i });
    fireEvent.click(downloadButton);

    // L'erreur de mot de passe invalide s'affiche
    expect(await screen.findByText(/Le mot de passe est invalide/i)).toBeInTheDocument();

    // L'utilisateur change le mot de passe, ça doit faire disparaître l'erreur visuelle
    fireEvent.change(passwordInput, { target: { value: 'good_password' } });
    expect(screen.queryByText(/Le mot de passe est invalide/i)).not.toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Home } from './Home';
import * as useUploadHook from '../../upload/hooks/useUpload';

vi.mock('../../upload/hooks/useUpload', () => ({
  useUpload: vi.fn(),
}));

describe('Home Component / Upload Flow (Integration)', () => {
  it('affiche la zone de drop initialement', () => {
    vi.mocked(useUploadHook.useUpload).mockReturnValue({
      state: 'idle',
      progress: 0,
      fileId: null,
      error: null,
      startUpload: vi.fn(),
      reset: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tu veux partager un fichier/i)).toBeInTheDocument();
  });

  it('affiche la barre de progression pendant l upload', () => {
    vi.mocked(useUploadHook.useUpload).mockReturnValue({
      state: 'uploading',
      progress: 45,
      fileId: null,
      error: null,
      startUpload: vi.fn(),
      reset: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Téléversement en cours/i)).toBeInTheDocument();
    expect(screen.getByText(/45%/i)).toBeInTheDocument();
  });

  it('affiche l ecran de succes avec le lien de telechargement', () => {
    vi.mocked(useUploadHook.useUpload).mockReturnValue({
      state: 'success',
      progress: 100,
      fileId: 'new-uuid-123',
      error: null,
      startUpload: vi.fn(),
      reset: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // On vérifie que le lien généré est présent
    expect(screen.getByText(/Félicitations/i)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('/d/new-uuid-123'))).toBeInTheDocument();

    // On mock le presse-papier
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    const copyBtn = screen.getByRole('button', { name: /Copier le lien/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/d/new-uuid-123'));
    
    // Le texte change en "Copié !"
    expect(screen.getByText(/Copié !/i)).toBeInTheDocument();

    // Tester le bouton "Partager un autre fichier" (reset)
    const resetBtn = screen.getByRole('button', { name: /Partager un autre fichier/i });
    fireEvent.click(resetBtn);
    expect(useUploadHook.useUpload().reset).toHaveBeenCalled();
  });

  it('permet de changer les options du formulaire (mot de passe, expiration) et d annuler', () => {
    vi.mocked(useUploadHook.useUpload).mockReturnValue({
      state: 'error', // Permet d'afficher la modale même sans fichier
      progress: 0,
      fileId: null,
      error: 'Une erreur bidon',
      startUpload: vi.fn(),
      reset: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Tape un mot de passe
    const passwordInput = screen.getByPlaceholderText(/Optionnel/i);
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    expect(passwordInput).toHaveValue('secret');

    // Change l'expiration
    const selectExp = screen.getByRole('combobox');
    fireEvent.change(selectExp, { target: { value: '3' } });
    expect(selectExp).toHaveValue('3');

    // L'erreur s'affiche
    expect(screen.getByText(/Une erreur bidon/i)).toBeInTheDocument();

    // Test du bouton "Changer"
    const changeBtn = screen.getByRole('button', { name: /Changer/i });
    fireEvent.click(changeBtn);
    expect(useUploadHook.useUpload().reset).toHaveBeenCalled();
  });
});

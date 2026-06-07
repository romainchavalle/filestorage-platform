import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { FileCard } from './FileCard';

describe('FileCard Component', () => {
  const baseFile = {
    id: '1',
    original_name: 'test.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1000,
    isProtected: false,
    created_at: new Date().toISOString(),
  };

  it('affiche correctement "Expire aujourd hui"', () => {
    // Fichier expire dans 1 heure
    const file = { ...baseFile, expires_at: new Date(Date.now() + 3600000).toISOString() };
    render(<MemoryRouter><FileCard file={file} /></MemoryRouter>);
    expect(screen.getByText(/Expire aujourd'hui/i)).toBeInTheDocument();
  });

  it('affiche correctement "Expire demain"', () => {
    // Fichier expire dans 25 heures
    const file = { ...baseFile, expires_at: new Date(Date.now() + 86400000 + 3600000).toISOString() };
    render(<MemoryRouter><FileCard file={file} /></MemoryRouter>);
    expect(screen.getByText(/Expire demain/i)).toBeInTheDocument();
  });

  it('affiche correctement "Expire dans X jours"', () => {
    // Fichier expire dans 3 jours et 1h
    const file = { ...baseFile, expires_at: new Date(Date.now() + 3 * 86400000 + 3600000).toISOString() };
    render(<MemoryRouter><FileCard file={file} /></MemoryRouter>);
    expect(screen.getByText(/Expire dans 3 jours/i)).toBeInTheDocument();
  });

  it('gère l ouverture, fermeture et confirmation de la modale de suppression', () => {
    const onDeleteMock = vi.fn();
    const file = { ...baseFile, expires_at: new Date(Date.now() + 86400000 + 3600000).toISOString() };
    render(<MemoryRouter><FileCard file={file} onDelete={onDeleteMock} /></MemoryRouter>);

    // Clique sur supprimer
    fireEvent.click(screen.getByRole('button', { name: /Supprimer/i }));

    // La modale doit s'afficher
    expect(screen.getByText(/Supprimer le fichier/i)).toBeInTheDocument();

    // Clique sur Annuler
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    
    // Rouvre la modale
    fireEvent.click(screen.getByRole('button', { name: /Supprimer/i }));

    // Clique sur Confirmer
    fireEvent.click(screen.getByRole('button', { name: /Supprimer définitivement/i }));

    expect(onDeleteMock).toHaveBeenCalledWith('1');
  });
});

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUpload } from './useUpload';
import { uploadApi } from '../upload.api';

vi.mock('../upload.api', () => ({
  uploadApi: {
    initUpload: vi.fn(),
    uploadToS3: vi.fn(),
    completeUpload: vi.fn(),
  },
}));

describe('useUpload Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gère l etat initial correctement', () => {
    const { result } = renderHook(() => useUpload());
    expect(result.current.state).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('gere le flux d upload complet avec succes', async () => {
    vi.mocked(uploadApi.initUpload).mockResolvedValue({ fileId: 'new-id', presignedUrl: 'http://s3' } as any);
    vi.mocked(uploadApi.uploadToS3).mockImplementation((url, file, onProgress) => {
      if (onProgress) onProgress({ loaded: 50, total: 100 } as any);
      return Promise.resolve();
    });
    vi.mocked(uploadApi.completeUpload).mockResolvedValue({} as any);

    const { result } = renderHook(() => useUpload());

    const fakeFile = new File(['hello'], 'test.png', { type: 'image/png' });
    
    let uploadPromise: Promise<void>;
    act(() => {
      uploadPromise = result.current.startUpload(fakeFile, { expiresInDays: 7, tags: [] });
    });

    await act(async () => {
      await uploadPromise;
    });

    expect(uploadApi.initUpload).toHaveBeenCalled();
    expect(uploadApi.uploadToS3).toHaveBeenCalled();
    expect(uploadApi.completeUpload).toHaveBeenCalledWith('new-id');
    
    expect(result.current.state).toBe('success');
    expect(result.current.fileId).toBe('new-id');
    expect(result.current.progress).toBe(50); // Mémorisé d'après notre mock
  });

  it('gere les erreurs de validation frontend (Zod)', async () => {
    const { result } = renderHook(() => useUpload());

    const fakeFile = new File([''], 'test.txt');
    
    await act(async () => {
      // Provoque une erreur Zod (expiresInDays doit être positif selon le schéma théoriquement)
      // Ou avec un mot de passe trop long etc.
      // Au pire, Zod pètera sur qq chose de basique.
      await result.current.startUpload(fakeFile, { expiresInDays: -1, tags: [] });
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBeTruthy();
    expect(uploadApi.initUpload).not.toHaveBeenCalled();
  });

  it('gere les erreurs de backend', async () => {
    vi.mocked(uploadApi.initUpload).mockRejectedValue(new Error('Backend en panne'));

    const { result } = renderHook(() => useUpload());
    const fakeFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
      await result.current.startUpload(fakeFile, { expiresInDays: 7, tags: [] });
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Backend en panne');
  });

  it('peut etre reinitialise', () => {
    const { result } = renderHook(() => useUpload());
    
    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('idle');
  });
});

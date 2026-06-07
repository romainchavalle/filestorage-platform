import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboard } from './useDashboard';
import { dashboardApi } from '../dashboard.api';

vi.mock('../dashboard.api', () => ({
  dashboardApi: {
    getFiles: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

describe('useDashboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge les fichiers au montage', async () => {
    const mockFiles = [{ id: '1', expires_at: new Date(Date.now() + 100000).toISOString() }];
    vi.mocked(dashboardApi.getFiles).mockResolvedValue(mockFiles as any);

    const { result } = renderHook(() => useDashboard());

    // Au début, isLoading est true
    expect(result.current.isLoading).toBe(true);

    // On attend la résolution de la promesse (le useEffect)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.files).toHaveLength(1);
  });

  it('filtre les fichiers correctement', async () => {
    const mockFiles = [
      { id: 'active', expires_at: new Date(Date.now() + 100000).toISOString() },
      { id: 'expired', expires_at: new Date(Date.now() - 100000).toISOString() }
    ];
    vi.mocked(dashboardApi.getFiles).mockResolvedValue(mockFiles as any);

    const { result } = renderHook(() => useDashboard());
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });

    // filter: 'all' par défaut
    expect(result.current.files).toHaveLength(2);

    act(() => result.current.setFilter('active'));
    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].id).toBe('active');

    act(() => result.current.setFilter('expired'));
    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].id).toBe('expired');
  });

  it('supprime un fichier', async () => {
    const mockFiles = [{ id: '1', expires_at: new Date(Date.now() + 100000).toISOString() }];
    vi.mocked(dashboardApi.getFiles).mockResolvedValue(mockFiles as any);
    vi.mocked(dashboardApi.deleteFile).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboard());
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });

    expect(result.current.files).toHaveLength(1);

    await act(async () => {
      await result.current.handleDeleteFile('1');
    });

    expect(dashboardApi.deleteFile).toHaveBeenCalledWith('1');
    expect(result.current.files).toHaveLength(0);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardApi } from './dashboard.api';
import client from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('dashboard.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getFiles appelle GET /files', async () => {
    const mockFiles = [{ id: '1' }];
    vi.mocked(client.get).mockResolvedValue({ data: mockFiles });
    
    const result = await dashboardApi.getFiles();
    
    expect(client.get).toHaveBeenCalledWith('/files');
    expect(result).toEqual(mockFiles);
  });

  it('deleteFile appelle DELETE /files/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue({});
    
    await dashboardApi.deleteFile('uuid-123');
    
    expect(client.delete).toHaveBeenCalledWith('/files/uuid-123');
  });
});

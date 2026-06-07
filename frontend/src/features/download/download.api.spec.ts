import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadApi } from './download.api';
import client from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('download.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublicInfo appelle GET /download/:id/public', async () => {
    const mockInfo = { id: '1' };
    vi.mocked(client.get).mockResolvedValue({ data: mockInfo });
    
    const result = await downloadApi.getPublicInfo('uuid-123');
    
    expect(client.get).toHaveBeenCalledWith('/download/uuid-123/public');
    expect(result).toEqual(mockInfo);
  });

  it('getDownloadUrl appelle POST /download/:id/link', async () => {
    const mockRes = { downloadUrl: 'http://test' };
    vi.mocked(client.post).mockResolvedValue({ data: mockRes });
    
    const result = await downloadApi.getDownloadUrl('uuid-123', { password: 'pass' });
    
    expect(client.post).toHaveBeenCalledWith('/download/uuid-123/link', { password: 'pass' });
    expect(result).toEqual(mockRes);
  });
});

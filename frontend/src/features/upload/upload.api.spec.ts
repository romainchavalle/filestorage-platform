import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadApi } from './upload.api';
import client from '../../api/client';
import axios from 'axios';

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('upload.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initUpload appelle POST /upload/init', async () => {
    const mockRes = { fileId: '123' };
    vi.mocked(client.post).mockResolvedValue({ data: mockRes });
    
    const data = { originalName: 'test.png', mimeType: 'image/png', sizeBytes: 100, expiresInDays: 7, password: '', tags: [] };
    const result = await uploadApi.initUpload(data);
    
    expect(client.post).toHaveBeenCalledWith('/upload/init', data);
    expect(result).toEqual(mockRes);
  });

  it('uploadToS3 utilise axios.put avec le presignedUrl', async () => {
    vi.mocked(axios.put).mockResolvedValue({});
    
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const onProgress = vi.fn();
    
    await uploadApi.uploadToS3('http://s3.url', file, onProgress);
    
    expect(axios.put).toHaveBeenCalledWith('http://s3.url', file, {
      headers: { 'Content-Type': 'text/plain' },
      onUploadProgress: onProgress,
    });
  });

  it('completeUpload appelle PATCH /upload/complete/:id', async () => {
    vi.mocked(client.patch).mockResolvedValue({ data: { success: true } });
    
    const result = await uploadApi.completeUpload('uuid-123');
    
    expect(client.patch).toHaveBeenCalledWith('/upload/complete/uuid-123');
    expect(result).toEqual({ success: true });
  });
});

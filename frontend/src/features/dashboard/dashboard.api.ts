import client from '../../api/client';
import type { FileResponseDto } from 'shared';

export const dashboardApi = {
  getFiles: async (): Promise<FileResponseDto[]> => {
    const response = await client.get<FileResponseDto[]>('/files');
    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await client.delete(`/files/${id}`);
  }
};

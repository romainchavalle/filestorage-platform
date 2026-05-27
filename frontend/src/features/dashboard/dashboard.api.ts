import client from '../../api/client';
import type { FileResponseDto } from 'shared';

export const dashboardApi = {
  getFiles: async () => {
    const response = await client.get<FileResponseDto[]>('/files');
    return response.data;
  },
};

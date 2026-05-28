import client from '../../api/client';
import type { PublicFileInfoDto, DownloadRequestDto, DownloadResponseDto } from 'shared';

export const downloadApi = {
  getPublicInfo: async (id: string): Promise<PublicFileInfoDto> => {
    const response = await client.get<PublicFileInfoDto>(`/download/${id}/public`);
    return response.data;
  },

  getDownloadUrl: async (id: string, data: DownloadRequestDto): Promise<DownloadResponseDto> => {
    const response = await client.post<DownloadResponseDto>(`/download/${id}/link`, data);
    return response.data;
  }
};

import client from '../../api/client';
import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';
import type { UploadInitDto, UploadInitResponseDto } from 'shared';

export const uploadApi = {
  initUpload: async (data: UploadInitDto) => {
    const response = await client.post<UploadInitResponseDto>(
      '/upload/init',
      data
    );
    return response.data;
  },

  uploadToS3: async (
    presignedUrl: string,
    file: File,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ) => {
    // Utilisation de axios brut pour ne pas envoyer le token JWT à AWS S3
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: onProgress,
    });
  },

  completeUpload: async (fileId: string) => {
    const response = await client.patch(`/upload/complete/${fileId}`);
    return response.data;
  },
};

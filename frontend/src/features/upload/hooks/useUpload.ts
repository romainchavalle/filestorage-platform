import { useState } from 'react';
import { uploadApi } from './upload.api';
import { UploadInitDto } from 'shared';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export const useUpload = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const startUpload = async (file: File, options: Omit<UploadInitDto, 'originalName' | 'mimeType' | 'sizeBytes'>) => {
    try {
      setState('uploading');
      setProgress(0);
      setError(null);

      // 1. Demander l'URL pré-signée
      const initData: UploadInitDto = {
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        password: options.password,
        expiresInDays: options.expiresInDays,
        tags: options.tags,
      };

      const { fileId: newFileId, presignedUrl } = await uploadApi.initUpload(initData);
      setFileId(newFileId);

      // 2. Envoyer le fichier binaire à AWS S3
      await uploadApi.uploadToS3(presignedUrl, file, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      // 3. Confirmer au Backend
      await uploadApi.completeUpload(newFileId);
      
      setState('success');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setState('error');
      // On récupère le message d'erreur s'il vient de Zod (API)
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors du téléversement.';
      setError(errorMessage);
    }
  };

  const reset = () => {
    setState('idle');
    setProgress(0);
    setError(null);
    setFileId(null);
  };

  return {
    state,
    progress,
    error,
    fileId,
    startUpload,
    reset,
  };
};

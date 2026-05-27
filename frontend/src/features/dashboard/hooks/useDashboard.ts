import { useState, useEffect } from 'react';
import { dashboardApi } from '../dashboard.api';
import type { FileResponseDto } from 'shared';

export function useDashboard() {
  const [files, setFiles] = useState<FileResponseDto[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getFiles()
      .then(setFiles)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredFiles = files.filter((file) => {
    const isExpired = new Date(file.expires_at) < new Date();
    
    if (filter === 'active') return !isExpired;
    if (filter === 'expired') return isExpired;
    return true; // 'all'
  });

  const handleDeleteFile = async (id: string) => {
    try {
      await dashboardApi.deleteFile(id);
      setFiles((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    }
  };

  return {
    files: filteredFiles,
    filter,
    setFilter,
    isLoading,
    handleDeleteFile,
  };
}

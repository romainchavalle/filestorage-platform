import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { FileCard } from '../components/FileCard';

export const Dashboard: React.FC = () => {
  const { files, filter, setFilter, isLoading } = useDashboard();

  return (
    <div className="max-w-5xl">
      {/* En-tête */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">Mes fichiers</h2>
        
        {/* Filtres (Segmented Control) */}
        <div className="inline-flex items-center gap-1 p-1 bg-[#FDF8F5] border border-orange-200/60 rounded-full">
          {(['all', 'active', 'expired'] as const).map((f) => {
            const labels = { all: 'Tous', active: 'Actifs', expired: 'Expiré' };
            const isActive = filter === f;
            
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E36666] text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des fichiers */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500 animate-pulse">Chargement de vos fichiers...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          Vous n'avez aucun fichier dans cette catégorie.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};

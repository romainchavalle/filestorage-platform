import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, Film, Music, FileText, File as FileIcon, Lock, Trash2, ArrowRight } from 'lucide-react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import type { FileResponseDto } from 'shared';

interface FileCardProps {
  file: FileResponseDto;
  onDelete?: (id: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Logique d'expiration
  const expiresAt = new Date(file.expires_at);
  const now = new Date();
  const isExpired = expiresAt < now;
  
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let expireText = '';
  if (isExpired) {
    expireText = 'Expiré';
  } else if (diffDays === 1) {
    expireText = 'Expire demain';
  } else if (diffDays === 0) {
    expireText = "Expire aujourd'hui";
  } else {
    expireText = `Expire dans ${diffDays} jours`;
  }

  // 2. Logique de l'icône selon le type MIME
  const getIcon = () => {
    if (file.mime_type.startsWith('image/')) return <Image className="text-gray-900" size={20} />;
    if (file.mime_type.startsWith('video/')) return <Film className="text-gray-900" size={20} />;
    if (file.mime_type.startsWith('audio/')) return <Music className="text-gray-900" size={20} />;
    if (file.mime_type.startsWith('text/')) return <FileText className="text-gray-900" size={20} />;
    return <FileIcon className="text-gray-900" size={20} />;
  };

  return (
    <>
      <div
        className={`flex items-center gap-4 px-5 py-3 rounded-lg border transition-all ${
        isExpired
          ? 'bg-[#FCF9F2] border-orange-900/5 opacity-80'
          : 'bg-white border-orange-900/10 hover:shadow-md'
      }`}
    >
      {/* Icône du fichier */}
      <div className="shrink-0 flex items-center justify-center w-8">
        {getIcon()}
      </div>

      {/* Informations (Nom + Expiration) */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm truncate ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
          {file.original_name}
        </h3>
        <p className={`text-[13px] mt-0.5 ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
          {expireText}
        </p>
      </div>

      {/* Actions (Droite) */}
      <div className="shrink-0 flex items-center gap-3">
        {file.isProtected && <Lock size={15} className="text-gray-500 mr-2" />}
        
        {isExpired ? (
          <span className="text-xs text-gray-400 text-right">
            Ce fichier a expiré, il n'est plus stocké chez nous
          </span>
        ) : (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors text-[13px] font-medium"
            >
              <Trash2 size={15} />
              Supprimer
            </button>
            <Link
              to={`/d/${file.id}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors text-[13px] font-medium"
            >
              Accéder
              <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
    </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (onDelete) onDelete(file.id);
        }}
        title="Supprimer le fichier"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${file.original_name}" ? Cette action effacera également le fichier de nos serveurs AWS.`}
      />
    </>
  );
};

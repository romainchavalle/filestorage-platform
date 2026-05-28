import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { File as FileIcon, Info, AlertTriangle, DownloadCloud, Lock } from 'lucide-react';
import { downloadApi } from '../download.api';
import type { PublicFileInfoDto } from 'shared';

export const DownloadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [fileInfo, setFileInfo] = useState<PublicFileInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<'not_found' | 'invalid_password' | null>(null);
  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    downloadApi.getPublicInfo(id)
      .then((info) => {
        setFileInfo(info);
      })
      .catch((err) => {
        setErrorType('not_found');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    
    setIsDownloading(true);
    setErrorType(null);

    try {
      const response = await downloadApi.getDownloadUrl(id, { password });
      window.location.href = response.downloadUrl;
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorType('invalid_password');
      } else {
        setErrorType('not_found');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const getExpirationText = () => {
    if (!fileInfo) return '';
    const daysLeft = Math.ceil((new Date(fileInfo.expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return `Ce fichier expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFA78D] to-[#E36666] flex flex-col font-sans">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">DataShare</h1>
        <Link 
          to="/login"
          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
        >
          Se connecter
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Télécharger un fichier</h2>

          {isLoading ? (
            <div className="text-center text-gray-500 text-sm">Recherche du fichier en cours...</div>
          ) : errorType === 'not_found' ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              <AlertTriangle size={18} className="shrink-0" />
              Ce fichier est introuvable ou a été supprimé par son propriétaire.
            </div>
          ) : fileInfo ? (
            <div className="flex flex-col gap-5">
              
              <div className="flex items-start gap-3">
                <FileIcon size={24} className="text-gray-400 mt-1" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-gray-900 font-medium truncate" title={fileInfo.original_name}>
                    {fileInfo.original_name}
                  </span>
                  <span className="text-gray-500 text-sm">{formatBytes(fileInfo.size_bytes)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
                <Info size={16} />
                {getExpirationText()}
              </div>

              {fileInfo.isProtected && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                  <input
                    type="password"
                    placeholder="Saisissez le mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorType(null);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errorType === 'invalid_password' 
                        ? 'border-red-300 focus:ring-red-200 bg-red-50/30' 
                        : 'border-gray-300 focus:ring-orange-200 focus:border-orange-500'
                    }`}
                  />
                  
                  {errorType === 'invalid_password' && (
                    <div className="flex items-center gap-1.5 mt-1 text-red-500 text-sm font-medium">
                      <AlertTriangle size={14} />
                      Le mot de passe est invalide
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={isDownloading || (fileInfo.isProtected && password.length === 0)}
                className={`w-full flex justify-center items-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                  isDownloading || (fileInfo.isProtected && password.length === 0)
                    ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-orange-50 text-orange-500 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                {fileInfo.isProtected && password.length === 0 ? <Lock size={18} /> : <DownloadCloud size={18} />}
                {isDownloading ? 'Génération du lien...' : 'Télécharger'}
              </button>

            </div>
          ) : null}

        </div>
      </div>

      <div className="p-4 text-white/60 text-xs font-medium">
        Copyright DataShare© 2026
      </div>
    </div>
  );
};

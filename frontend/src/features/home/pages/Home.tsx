import { useState, useCallback } from 'react';
import { Upload, FileText, Copy, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../../upload/hooks/useUpload';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';

export function Home() {
  const { state, progress, fileId, error, startUpload, reset } = useUpload();
  
  // États locaux pour le formulaire (Écran 2)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [copied, setCopied] = useState(false);

  // Configuration de la zone de Drop (Écran 1)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxSize: 1073741824, // 1 Go
    multiple: false,
  });

  // Action du bouton "Téléverser" (Passage de l'Écran 2 à 3)
  const handleUploadClick = () => {
    if (selectedFile) {
      startUpload(selectedFile, { password, expiresInDays, tags: [] });
    }
  };

  // Action du bouton "Copier le lien" (Écran 3)
  const handleCopy = () => {
    const link = `${window.location.origin}/d/${fileId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPassword('');
    setExpiresInDays(7);
    reset();
  };

  return (
    <div className="bg-datashare flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        
        {/* ÉCRAN 1 : L'état initial (Le gros bouton Cloud) */}
        {!selectedFile && state === 'idle' && (
          <div {...getRootProps()} className="flex flex-col items-center outline-none">
            <input {...getInputProps()} />
            <p className="text-lg text-gray-900 mb-6 font-medium">
              Tu veux partager un fichier ?
            </p>
            {/* Design exact du bouton de la maquette : rond noir entouré d'un halo orange/rose */}
            <div className="w-20 h-20 rounded-full bg-orange-400/20 flex items-center justify-center cursor-pointer hover:bg-orange-400/30 transition-all">
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
                <Upload size={24} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* ÉCRAN 2 & 3 : La Carte Blanche Centrale (Modale) */}
        {(selectedFile || state === 'success') && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Ajouter un fichier</h2>

            {/* En-tête de la carte : Fichier sélectionné */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-gray-400 shrink-0" size={24} />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} Mo
                  </p>
                </div>
              </div>
              {(state === 'idle' || state === 'error') && (
                <button onClick={handleReset} className="text-sm text-orange-500 hover:text-orange-600 font-medium px-2 shrink-0">
                  Changer
                </button>
              )}
            </div>

            {/* ÉCRAN 2 : Formulaire (si on n'a pas encore uploadé ou en cas d'erreur) */}
            {(state === 'idle' || state === 'error') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Mot de passe</label>
                  <input
                    type="password"
                    placeholder="Optionnel"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Expiration</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  >
                    <option value={7}>Une semaine</option>
                    <option value={3}>3 jours</option>
                    <option value={1}>24 heures</option>
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm text-center font-medium mt-2">{error}</p>}

                <div className="pt-4 flex justify-center">
                  <button 
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 bg-white border border-orange-200 text-orange-500 px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-orange-50 transition-colors"
                  >
                    <Upload size={18} />
                    Téléverser
                  </button>
                </div>
              </div>
            )}

            {/* PENDANT L'UPLOAD : Barre de progression */}
            {state === 'uploading' && (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-gray-600 mb-3">Téléversement en cours... {progress}%</p>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-orange-400 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ÉCRAN 3 : Succès et Lien généré */}
            {state === 'success' && (
              <div className="text-center space-y-6">
                <p className="text-sm font-medium text-gray-800">
                  Félicitations, ton fichier sera conservé chez nous pendant {expiresInDays === 7 ? 'une semaine' : `${expiresInDays} jours`} !
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 break-all">
                  <p className="text-orange-500 font-medium text-sm">
                    {window.location.origin}/d/{fileId}
                  </p>
                </div>

                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center w-full gap-2 bg-white border border-orange-200 text-orange-500 px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-orange-50 transition-colors"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                
                <div className="pt-2">
                  <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 underline">
                    Partager un autre fichier
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

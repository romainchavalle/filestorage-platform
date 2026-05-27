import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Icône d'Alerte Rouge */}
            <div className="p-2 bg-red-100 rounded-full shrink-0">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            
            {/* Textes personnalisables */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
            </div>
            
            {/* Croix pour fermer */}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          {/* Boutons d'action */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onConfirm(); // On exécute l'action de suppression
                onClose();   // On ferme la modale
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

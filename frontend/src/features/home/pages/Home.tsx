import { Upload } from 'lucide-react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';

export function Home() {
  return (
    <div className="bg-datashare flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-lg text-gray-900 mb-6">
          Tu veux partager un fichier ?
        </p>

        {/* Icône upload (comme la maquette) — sera interactif en Phase 3 */}
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
          <Upload size={28} className="text-white" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

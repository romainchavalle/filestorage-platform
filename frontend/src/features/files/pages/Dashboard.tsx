import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';

export function Dashboard() {
  return (
    <div className="bg-datashare flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-500">
            Tes fichiers apparaîtront ici. (Phase 4)
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

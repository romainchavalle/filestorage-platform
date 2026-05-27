import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FCF9F2] flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-gradient-to-b from-[#FFA78D] to-[#E36666] flex flex-col justify-between text-white p-8">
        <div>
          {/* Logo */}
          <h1 className="text-[32px] font-bold mb-12 tracking-tight">DataShare</h1>

          {/* Navigation */}
          <nav>
            <div className="bg-white/30 text-orange-950 font-semibold px-5 py-3 rounded-xl cursor-default shadow-sm backdrop-blur-sm">
              Mes fichiers
            </div>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="text-sm text-white/90">
          Copyright DataShare® 2025
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-24 flex items-center justify-end px-12 gap-8 border-b border-orange-900/5">
          <Link
            to="/"
            className="bg-[#333333] hover:bg-black transition-colors text-white text-[15px] font-medium px-6 py-3 rounded-lg shadow-sm"
          >
            Ajouter des fichiers
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#E36666] hover:text-[#D15555] transition-colors text-[15px] font-medium"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

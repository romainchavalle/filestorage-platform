import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';

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
      <aside className="w-64 bg-gradient-to-b from-[#FFA78D] to-[#E36666] flex flex-col justify-between text-white p-6">
        <div>
          {/* Logo */}
          <h1 className="text-2xl font-bold mb-8 tracking-tight">DataShare</h1>

          {/* Navigation */}
          <nav>
            <div className="bg-white/40 text-[#4A2012] font-medium text-sm px-4 py-2 rounded-lg cursor-default">
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
        <header className="h-20 flex items-center justify-end px-10 gap-6">
          <Link
            to="/"
            className="bg-[#333] hover:bg-black transition-colors text-white text-[13px] font-medium px-4 py-2 rounded-md"
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

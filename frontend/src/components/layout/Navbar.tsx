import { Link } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  return (
    <nav className="flex items-center justify-between px-8 py-4">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-gray-900 no-underline">
        DataShare
      </Link>

      {/* Bouton droit : change selon l'état auth */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm text-gray-700 hover:text-gray-900 no-underline"
          >
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors no-underline"
        >
          Se connecter
        </Link>
      )}
    </nav>
  );
}

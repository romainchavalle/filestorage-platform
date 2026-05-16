import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

// Wrapper qui protège une route — équivalent de CanActivate en Angular
// Usage : <ProtectedRoute><Dashboard /></ProtectedRoute>
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
    //                           ^^^^^^^ "replace" pour ne pas empiler
    //                           dans l'historique (évite le back infini)
  }

  return children;
}

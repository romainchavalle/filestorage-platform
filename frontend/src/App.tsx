import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './features/home/pages/Home';
import { Login } from './features/auth/pages/Login';
import { Register } from './features/auth/pages/Register';
import { Dashboard } from './features/files/pages/Dashboard';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserLoginSchema } from 'shared';
import type { UserLoginDto } from 'shared';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../auth.api';
import { useAuthStore } from '../useAuthStore';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { useState } from 'react';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [apiError, setApiError] = useState('');

  // ── react-hook-form + Zod ──────────────────────────────
  // zodResolver(UserLoginSchema) connecte le schéma Zod au formulaire
  // → la validation est automatique au submit
  const {
    register,       // lie un champ input au formulaire
    handleSubmit,   // gère le submit + lance la validation
    formState: { errors, isSubmitting },
    //           ^^^^^^  les erreurs de validation Zod
    //                    ^^^^^^^^^^^^  true pendant l'appel API
  } = useForm<UserLoginDto>({
    resolver: zodResolver(UserLoginSchema),
  });

  // ── Handler submit ─────────────────────────────────────
  // Appelé UNIQUEMENT si la validation Zod passe
  const onSubmit = async (data: UserLoginDto) => {
    try {
      setApiError('');
      const result = await loginApi(data.email, data.password);
      login(result.access_token);  // stocke le token dans le store
      navigate('/dashboard');       // redirige vers le dashboard
    } catch {
      setApiError('Email ou mot de passe incorrect');
    }
  };

  // ── JSX (le "HTML") ────────────────────────────────────
  return (
    <div className="bg-datashare flex flex-col min-h-screen">
      <Navbar />

      {/* Carte blanche centrée (comme la maquette) */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Connexion
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Saisissez votre email..."
                {...register('email')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="Saisissez votre mot de passe..."
                {...register('password')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Erreur API (ex: mauvais identifiants) */}
            {apiError && (
              <p className="text-red-500 text-sm text-center">{apiError}</p>
            )}

            {/* Lien vers Register */}
            <div className="text-center">
              <Link to="/register" className="text-orange-500 text-sm hover:underline">
                Créer un compte
              </Link>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-300 to-orange-400 text-white font-semibold py-2.5 rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Connexion...' : 'Connexion'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRegisterSchema } from 'shared';
import type { UserRegisterDto } from 'shared';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi, loginApi } from '../auth.api';
import { useAuthStore } from '../useAuthStore';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { useState } from 'react';

export function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterDto>({
    resolver: zodResolver(UserRegisterSchema),
  });

  const onSubmit = async (data: UserRegisterDto) => {
    try {
      setApiError('');
      // 1. Crée le compte
      await registerApi(data.email, data.password, data.confirmPassword);
      // 2. Auto-login (connecte directement après l'inscription)
      const result = await loginApi(data.email, data.password);
      login(result.access_token);
      navigate('/dashboard');
    } catch {
      setApiError('Cet email est déjà utilisé');
    }
  };

  return (
    <div className="bg-datashare flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Créer un compte
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
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

            {/* Mot de passe */}
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

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Vérification du mot de passe
              </label>
              <input
                type="password"
                placeholder="Saisissez-le à nouveau..."
                {...register('confirmPassword')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Erreur API */}
            {apiError && (
              <p className="text-red-500 text-sm text-center">{apiError}</p>
            )}

            {/* Lien vers Login */}
            <div className="text-center">
              <Link to="/login" className="text-orange-500 text-sm hover:underline">
                J'ai déjà un compte
              </Link>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-300 to-orange-400 text-white font-semibold py-2.5 rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

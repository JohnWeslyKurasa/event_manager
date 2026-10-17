import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { User } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const authData = (response.data as any) || (response as any);
      if (response.success && authData.token && authData.user) {
        login(authData.token, authData.user);
        navigate(authData.user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/events');
      } else {
        setError(response.message || 'Login failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-10 h-10 bg-sage-600 rounded-full flex items-center justify-center text-cream-50 shadow-soft-natural">
              <Sparkles size={18} className="text-cream-100" />
            </div>
            <span className="font-serif font-bold text-2xl text-botanical-900">
              EventPulse
            </span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-botanical-900 mb-1">Welcome Back</h1>
          <p className="text-xs text-botanical-500">Sign in to your EventPulse account</p>
        </div>

        {/* Form Card */}
        <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-8 shadow-elevated-natural">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-natural animate-fade-in text-red-700 text-xs">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="input-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@eventpulse.com"
                className="input-field text-xs"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="input-label mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11 text-xs"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-botanical-400 hover:text-botanical-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-xs shadow-soft-natural mt-2"
              id="login-submit-button"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-botanical-500 text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-sage-700 hover:text-sage-900 font-semibold underline underline-offset-4">
                Register free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-cream-100/60 border border-cream-200 rounded-natural text-center shadow-sm">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-botanical-500 mb-2.5">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('organizer@eventpulse.com')}
              className="bg-cream-50 hover:bg-cream-200/70 p-2.5 rounded-natural border border-cream-200 text-left transition-colors"
            >
              <p className="font-semibold text-botanical-900">Organizer Demo</p>
              <p className="text-[10px] text-botanical-500 truncate">organizer@eventpulse.com</p>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('attendee@eventpulse.com')}
              className="bg-cream-50 hover:bg-cream-200/70 p-2.5 rounded-natural border border-cream-200 text-left transition-colors"
            >
              <p className="font-semibold text-botanical-900">Attendee Demo</p>
              <p className="text-[10px] text-botanical-500 truncate">attendee@eventpulse.com</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

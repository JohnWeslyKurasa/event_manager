import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Loader2, AlertCircle, Check, Building2, User, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { User as UserType } from '../types';

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ATTENDEE' as 'ATTENDEE' | 'ORGANIZER',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  };

  const strengthConfig = [
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-amber-400' },
    { label: 'Good', color: 'bg-sage-400' },
    { label: 'Strong', color: 'bg-sage-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
        ...(form.role === 'ORGANIZER' && form.organizationName
          ? { organizationName: form.organizationName }
          : {}),
      };

      const response = await authApi.register(payload);
      const authData = (response.data as any) || (response as any);
      if (response.success && authData.token && authData.user) {
        login(authData.token, authData.user);
        navigate(authData.user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/events');
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = passwordStrength();

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
          <h1 className="font-serif text-3xl font-bold text-botanical-900 mb-1">Create Account</h1>
          <p className="text-xs text-botanical-500">Join our curated event ecosystem</p>
        </div>

        <div className="bg-cream-100/90 border border-cream-200 rounded-natural p-8 shadow-elevated-natural">
          {/* Role Toggle */}
          <div className="flex bg-cream-50 rounded-natural p-1 mb-6 border border-cream-200 shadow-sm">
            {(['ATTENDEE', 'ORGANIZER'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => update('role', r)}
                id={`role-${r.toLowerCase()}`}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  form.role === r
                    ? 'bg-sage-600 text-cream-50 shadow-sm'
                    : 'text-botanical-600 hover:text-botanical-900'
                }`}
              >
                {r === 'ATTENDEE' ? (
                  <>
                    <Ticket size={13} />
                    <span>Attendee</span>
                  </>
                ) : (
                  <>
                    <Building2 size={13} />
                    <span>Organizer</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-natural animate-fade-in text-red-700 text-xs">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="input-label">Full Name</label>
              <input
                id="reg-name"
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Eleanor Vance"
                className="input-field text-xs"
                required
              />
            </div>

            {form.role === 'ORGANIZER' && (
              <div className="animate-fade-in">
                <label htmlFor="reg-org" className="input-label">
                  <Building2 size={12} className="inline mr-1 text-sage-600" />
                  Organization / Studio Name
                </label>
                <input
                  id="reg-org"
                  type="text"
                  value={form.organizationName}
                  onChange={(e) => update('organizationName', e.target.value)}
                  placeholder="Apex Innovations Studio"
                  className="input-field text-xs"
                />
              </div>
            )}

            <div>
              <label htmlFor="reg-email" className="input-label">Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="curator@eventpulse.com"
                className="input-field text-xs"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="input-label">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-field pr-11 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-botanical-400 hover:text-botanical-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength */}
              {form.password && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthConfig[Math.min(strength - 1, 3)]?.color || 'bg-sage-600' : 'bg-cream-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-600' : 'text-sage-700'}`}>
                    {strengthConfig[Math.min(strength - 1, 3)]?.label || 'Weak'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="input-label">Confirm Password</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password"
                  className="input-field pr-11 text-xs"
                  required
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Check size={15} className="text-sage-600" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-xs shadow-soft-natural mt-2"
              id="register-submit-button"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating account...</>
              ) : (
                `Register as ${form.role === 'ORGANIZER' ? 'Organizer' : 'Attendee'}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-botanical-500 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-sage-700 hover:text-sage-900 font-semibold underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

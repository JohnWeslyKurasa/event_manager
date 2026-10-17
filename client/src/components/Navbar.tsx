import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Ticket, LogOut, Menu, X, LayoutDashboard, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  user?: { fullName: string; role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN' } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentUser = props.user !== undefined ? props.user : auth.user;

  // Scroll-aware navbar elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (props.onLogout) {
      props.onLogout();
    } else {
      auth.logout();
    }
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-cream-50/95 backdrop-blur-xl border-b border-cream-200 shadow-navbar'
        : 'bg-cream-50/80 backdrop-blur-md border-b border-cream-200/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[68px] items-center">

          {/* ── Brand Logo ── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className={`w-9 h-9 rounded-full bg-sage-gradient flex items-center justify-center shadow-button-sage transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sage`}>
              <Leaf className="w-4 h-4 text-cream-50" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-botanical-900 leading-none">
                EventPulse
              </span>
              <span className="text-[9px] tracking-widest-sm uppercase font-semibold text-sage-600 mt-0.5 leading-none">
                Elegantly Curated
              </span>
            </div>
          </Link>

          {/* ── Nav Links (Desktop) ── */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium">
            <Link
              to="/events"
              className={`transition-colors duration-200 link-underline ${
                isActive('/events') ? 'text-sage-700 font-semibold' : 'text-botanical-600 hover:text-sage-700'
              }`}
            >
              Explore
            </Link>

            {currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN' ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 transition-colors duration-200 link-underline ${
                    isActive('/dashboard') ? 'text-sage-700 font-semibold' : 'text-botanical-600 hover:text-sage-700'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link
                  to="/events/create"
                  className={`flex items-center gap-1.5 transition-colors duration-200 link-underline ${
                    isActive('/events/create') ? 'text-sage-700 font-semibold' : 'text-botanical-600 hover:text-sage-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </Link>
              </>
            ) : null}

            {currentUser && (
              <Link
                to="/my-tickets"
                className={`flex items-center gap-1.5 transition-colors duration-200 link-underline ${
                  isActive('/my-tickets') ? 'text-sage-700 font-semibold' : 'text-botanical-600 hover:text-sage-700'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                My Tickets
              </Link>
            )}
          </div>

          {/* ── Auth Zone (Desktop) ── */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Avatar + name */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sage-gradient flex items-center justify-center text-cream-50 text-xs font-bold shadow-button-sage">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-botanical-900 leading-none">{currentUser.fullName.split(' ')[0]}</p>
                    <p className="text-[10px] text-sage-600 font-medium mt-0.5 capitalize">{currentUser.role.toLowerCase()}</p>
                  </div>
                </div>

                <div className="h-5 w-px bg-cream-300" />

                <button
                  onClick={handleLogout}
                  className="p-2 text-botanical-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-[13px] font-medium text-botanical-600 hover:text-sage-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-[13px] px-5 py-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Toggle ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-botanical-600 hover:bg-cream-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen
              ? <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden frosted-surface border-b border-cream-200 px-4 py-5 space-y-5 animate-slide-down">
          <nav className="flex flex-col gap-1">
            {[
              { to: '/events', label: 'Explore Events' },
              ...(currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN' ? [
                { to: '/dashboard', label: 'Organiser Dashboard' },
                { to: '/events/create', label: 'Create Event' },
                { to: '/check-in', label: 'Check-In Scanner' },
              ] : []),
              ...(currentUser ? [{ to: '/my-tickets', label: 'My Tickets' }] : []),
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`text-sm py-2.5 px-3 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'bg-sage-100 text-sage-800 font-semibold'
                    : 'text-botanical-700 hover:bg-cream-100 hover:text-botanical-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-cream-200">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-sage-gradient flex items-center justify-center text-cream-50 text-sm font-bold shadow-button-sage">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-botanical-900">{currentUser.fullName}</p>
                    <p className="text-[11px] text-sage-600 font-medium capitalize">{currentUser.role.toLowerCase()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm py-2.5 rounded-natural border border-cream-300 text-botanical-700 hover:bg-cream-100 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm py-2.5 rounded-natural bg-sage-600 hover:bg-sage-700 text-cream-50 font-semibold transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

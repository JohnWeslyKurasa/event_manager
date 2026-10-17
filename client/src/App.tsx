import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import EventListingPage from './pages/EventListingPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventCreatePage from './pages/EventCreatePage';
import MyTicketsPage from './pages/MyTicketsPage';
import CheckInPage from './pages/CheckInPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Array<'ATTENDEE' | 'ORGANIZER' | 'ADMIN'>;
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center text-sage-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sage-600 border-r-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 text-botanical-800 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventListingPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Attendee / Authenticated Checkout & Tickets */}
          <Route
            path="/events/:id/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <EventCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-in"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <CheckInPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-in/:eventId"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <CheckInPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Premium Botanical Footer */}
      <footer className="bg-cream-100 border-t border-cream-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-sage-gradient flex items-center justify-center shadow-button-sage">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-cream-50"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span className="font-display text-xl font-bold text-botanical-900">EventPulse</span>
              </div>
              <p className="text-xs text-botanical-500 font-light max-w-[200px] leading-relaxed">
                Elegantly curated experiences, powered by AI.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs text-botanical-500">
              <a href="/events" className="hover:text-sage-700 transition-colors link-underline">Explore Events</a>
              <a href="/register" className="hover:text-sage-700 transition-colors link-underline">Get Started</a>
              <a href="/login" className="hover:text-sage-700 transition-colors link-underline">Sign In</a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-botanical-400">
              Powered by <span className="font-medium text-botanical-500">Google Gemini 2.5 AI</span> · Built with Node.js & React
            </p>
            <p className="text-[11px] text-botanical-400">
              &copy; {new Date().getFullYear()} EventPulse, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

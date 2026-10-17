import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authApi } from '../services/api';

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'eventpulse_token';
const USER_KEY = 'eventpulse_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuthState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.getMe();
      const userData = (response.data as any)?.user || (response as any).user || (response.data as any);
      if (response.success && userData && userData.email) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setAuthState({
          user: userData,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [logout]);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setAuthState({ user, token, isLoading: false, isAuthenticated: true });
        // Silently refresh in the background
        refreshUser();
      } catch {
        logout();
      }
    } else {
      setAuthState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

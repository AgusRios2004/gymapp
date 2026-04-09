import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('gym-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', parsedUser.token);
      }
      return parsedUser;
    }
    return null;
  });

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem('gym-user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym-user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

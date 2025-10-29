import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { apiLogin, apiSignUp } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('canteen-user');
      const token = localStorage.getItem('canteen-token');
      
      // A real app would validate the token with the backend here
      if (storedUser && token) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('canteen-user');
      localStorage.removeItem('canteen-token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
      const loggedInUser = await apiLogin(email, pass);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('canteen-user', JSON.stringify(loggedInUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, pass:string) => {
    try {
        const newUser = await apiSignUp(name, email, pass);
        if (newUser) {
            setUser(newUser);
            localStorage.setItem('canteen-user', JSON.stringify(newUser));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Signup failed', error);
        return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('canteen-user');
    localStorage.removeItem('canteen-token');
  }, []);

  if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      )
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

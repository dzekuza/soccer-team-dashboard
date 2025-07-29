"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/use-auth';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthHook();

  return (
    <AuthContext.Provider value={{ user, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
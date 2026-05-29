import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';

type UserRole = 'admin' | 'student' | null;

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === 'admin';
    const inStudentGroup = segments[0] === 'student';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/');
    } else if (user) {
      if (user.role === 'admin' && !inAdminGroup) {
        router.replace('/admin/events');
      } else if (user.role === 'student' && !inStudentGroup) {
        router.replace('/student/events');
      }
    }
  }, [user, segments, isLoading]);

  async function loadStorageData() {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, role: UserRole) {
    const newUser = { email, role };
    setUser(newUser);
    await SecureStore.setItemAsync('user', JSON.stringify(newUser));
  }

  async function signOut() {
    setUser(null);
    await SecureStore.deleteItemAsync('user');
    router.replace('/');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
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

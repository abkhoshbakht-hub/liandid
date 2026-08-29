'use client';

import { useSession, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthor = session?.user?.role === 'AUTHOR' || isAdmin;
  const isLoading = status === 'loading';

  const logout = () => {
    signOut({ callbackUrl: '/' });
  };

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isAdmin,
    isAuthor,
    isLoading,
    logout,
  };
}
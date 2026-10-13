'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'brand' | 'creator';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.push('/login');
      } else if (allowedRole && user.role !== allowedRole) {
        router.push(user.role === 'brand' ? '/brand' : '/creator');
      }
    }
  }, [token, user, isLoading, allowedRole, router]);

  if (isLoading || !token || !user || (allowedRole && user.role !== allowedRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

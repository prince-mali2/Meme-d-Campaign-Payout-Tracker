'use client';

import React from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="creator">
      {children}
    </ProtectedRoute>
  );
}

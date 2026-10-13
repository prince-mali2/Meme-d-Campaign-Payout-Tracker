'use client';

import React from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="brand">
      {children}
    </ProtectedRoute>
  );
}

import React, { Suspense } from 'react';
import BrandDashboardContent from './BrandDashboardContent';

export default function BrandDashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 font-medium">Loading brand command center...</div>}>
      <BrandDashboardContent />
    </Suspense>
  );
}

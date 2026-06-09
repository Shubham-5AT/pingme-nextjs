'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import AdminRoute from '@/components/auth/AdminRoute';
import Admin from '@/src/screens/Admin';

export default function AdminPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AdminRoute>
          <Admin />
        </AdminRoute>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
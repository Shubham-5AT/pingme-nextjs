'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import AdminRoute from '@/components/auth/AdminRoute';
import dynamic from 'next/dynamic';
const Admin = dynamic(() => import('@/src/screens/Admin'), { ssr: false });

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
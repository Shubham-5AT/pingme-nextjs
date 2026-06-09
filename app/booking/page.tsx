'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Prebook from '@/src/screens/Prebook';

export default function BookingPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute>
          <Prebook />
        </ProtectedRoute>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
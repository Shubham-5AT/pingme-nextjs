'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Profile from '@/src/screens/Profile';

export default function ProfilePage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
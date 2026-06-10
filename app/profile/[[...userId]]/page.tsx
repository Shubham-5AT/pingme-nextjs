'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import dynamic from 'next/dynamic';
const Profile = dynamic(() => import('@/src/screens/Profile'), { ssr: false });

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
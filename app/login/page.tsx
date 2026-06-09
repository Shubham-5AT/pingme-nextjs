'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Login from '@/src/screens/auth/Login';

export default function LoginPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
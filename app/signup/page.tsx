'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Signup from '@/src/screens/auth/Signup';

export default function SignupPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Signup />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
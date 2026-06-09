'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import VerifyEmail from '@/src/screens/auth/VerifyEmail';

export default function VerifyEmailPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <VerifyEmail />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
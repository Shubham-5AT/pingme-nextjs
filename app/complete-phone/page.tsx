'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import CompletePhone from '@/src/screens/auth/CompletePhone';

export default function CompletePhonePage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <CompletePhone />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Landing from '@/src/screens/Landing';

export default function Home() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Landing />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
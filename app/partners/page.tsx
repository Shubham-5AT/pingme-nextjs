'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Partners from '@/src/screens/Partners';

export default function PartnersPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Partners />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
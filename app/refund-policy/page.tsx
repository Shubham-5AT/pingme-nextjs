'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import RefundPolicy from '@/src/screens/RefundPolicy';

export default function RefundPolicyPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <RefundPolicy />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
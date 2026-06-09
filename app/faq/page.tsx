'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import FAQ from '@/src/screens/FAQ';

export default function FAQPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <FAQ />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import TermsConditions from '@/src/screens/TermsConditions';

export default function TermsConditionsPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <TermsConditions />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
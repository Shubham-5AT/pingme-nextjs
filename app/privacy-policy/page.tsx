'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import PrivacyPolicy from '@/src/screens/PrivacyPolicy';

export default function PrivacyPolicyPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicy />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
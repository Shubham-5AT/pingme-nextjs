'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import PublicNFCProfile from '@/src/screens/PublicNFCProfile';

export default function UsernamePage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <PublicNFCProfile />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
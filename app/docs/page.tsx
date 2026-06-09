'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import DocsPage from '@/components/DocsPage';

export default function DocsRoutePage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <DocsPage />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
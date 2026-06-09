'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Blog from '@/src/screens/Blog';

export default function BlogPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Blog />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
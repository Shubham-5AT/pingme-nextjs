'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Products from '@/src/screens/Products';

export default function ProductsCategoryPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Products />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
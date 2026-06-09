'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import ProductDetail from '@/src/screens/ProductDetail';

export default function ProductDetailPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ProductDetail />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
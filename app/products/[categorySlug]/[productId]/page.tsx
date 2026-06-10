'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import dynamic from 'next/dynamic';
const ProductDetail = dynamic(() => import('@/src/screens/ProductDetail'), { ssr: false });

export default function ProductDetailPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ProductDetail />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
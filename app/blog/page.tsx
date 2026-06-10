'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import dynamic from 'next/dynamic';
const Blog = dynamic(() => import('@/src/screens/Blog'), { ssr: false });

export default function BlogPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Blog />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
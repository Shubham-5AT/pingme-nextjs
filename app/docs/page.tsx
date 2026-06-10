'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import dynamic from 'next/dynamic';
const DocsPage = dynamic(() => import('@/components/DocsPage'), { ssr: false });

export default function DocsRoutePage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <DocsPage />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
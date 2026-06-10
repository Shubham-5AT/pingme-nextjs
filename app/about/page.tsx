'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import dynamic from 'next/dynamic';
const About = dynamic(() => import('@/src/screens/About'), { ssr: false });

export default function AboutPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <About />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import Contact from '@/src/screens/Contact';

export default function ContactPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Contact />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import ForgotPassword from '@/src/screens/auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ForgotPassword />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

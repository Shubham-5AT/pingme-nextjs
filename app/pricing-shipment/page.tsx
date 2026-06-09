'use client';

import { Suspense } from 'react';
import PageLoader from '@/components/providers/PageLoader';
import ChunkErrorBoundary from '@/components/providers/ChunkErrorBoundary';
import PricingShipment from '@/src/screens/PricingShipment';

export default function PricingShipmentPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <PricingShipment />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
'use client';

import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-background gap-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
      </div>
      <p className="text-sm font-medium tracking-widest text-muted-foreground animate-pulse uppercase">
        Loading PingME
      </p>
    </div>
  );
}
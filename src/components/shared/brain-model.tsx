'use client';

import { Brain } from 'lucide-react';

export function BrainModel() {
  return (
    <div className="relative w-full h-full rounded-lg bg-card flex items-center justify-center p-4 overflow-hidden border">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      <div className="z-10 flex flex-col items-center justify-center text-center">
        <Brain className="w-24 h-24 text-primary/50 animate-pulse" />
        <p className="mt-4 text-sm text-muted-foreground">
          Live Neural Activity Feed
        </p>
      </div>
       <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

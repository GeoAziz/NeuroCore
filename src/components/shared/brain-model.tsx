
'use client';

import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrainModelProps {
  isInteractive?: boolean;
  showHeatmap?: boolean;
  showStress?: boolean;
}

export function BrainModel({ isInteractive = true, showHeatmap = false, showStress = false }: BrainModelProps) {
  return (
    <div className={cn("relative w-full h-full rounded-lg bg-card flex items-center justify-center p-4 overflow-hidden border", isInteractive && 'bg-black')}>
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      
      <div className="z-10 flex flex-col items-center justify-center text-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Brain className="w-full h-full text-primary/50 animate-pulse-glow" />
          {showHeatmap && (
             <div className="absolute inset-0 bg-gradient-to-t from-orange-500/50 via-red-500/30 to-yellow-500/10 rounded-full animate-pulse opacity-50 blur-xl"></div>
          )}
           {showStress && (
             <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent/60 rounded-full animate-pulse blur-2xl"></div>
          )}
        </div>
        
        {isInteractive ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Live Neural Activity Feed. <span className="hidden md:inline">Click & drag to rotate.</span>
            </p>
        ) : (
            <p className="mt-4 text-sm text-muted-foreground">
                BrainScan Snapshot
            </p>
        )}
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

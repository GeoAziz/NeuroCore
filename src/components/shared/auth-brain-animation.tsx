
'use client';

import { Brain } from 'lucide-react';
import React from 'react';

export function AuthBrainAnimation() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Orbiting particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/50 animate-orbit"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            animationDelay: `${i * -0.4}s`,
            '--orbit-radius': `${Math.floor(Math.random() * 40 + 70)}px`,
            '--orbit-duration': `${Math.floor(Math.random() * 8 + 12)}s`,
            filter: `blur(${Math.random() * 1.5}px)`
          }}
        />
      ))}

      <Brain className="w-40 h-40 text-primary/80 animate-pulse-glow" />
      <Brain className="absolute w-40 h-40 text-accent/50 animate-spin-slow opacity-50" style={{ animationDirection: 'reverse' }} />

      <style jsx>{`
        @keyframes orbit {
            0% { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg) scale(0.7); }
            50% { transform: rotate(180deg) translateX(var(--orbit-radius)) rotate(-180deg) scale(1); }
            100% { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg) scale(0.7); }
        }
        .animate-orbit {
            animation: orbit var(--orbit-duration) linear infinite;
        }
      `}</style>
    </div>
  );
}

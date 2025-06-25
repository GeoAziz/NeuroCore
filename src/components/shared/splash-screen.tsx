
'use client';
import { Brain } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export function SplashScreen() {
  const [particles, setParticles] = useState<{ style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const newParticles = [...Array(8)].map((_, i) => ({
      style: {
        width: `${Math.random() * 3 + 2}px`,
        height: `${Math.random() * 3 + 2}px`,
        animationDelay: `${i * -0.5}s`,
        '--orbit-radius': `${Math.floor(Math.random() * 50 + 80)}px`,
        '--orbit-duration': `${Math.floor(Math.random() * 10 + 15)}s`,
      },
    }));
    setParticles(newParticles);
  }, []); // Empty dependency array ensures this runs only once on the client

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>

      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Orbiting particles */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/50 animate-orbit"
            style={particle.style as React.CSSProperties}
          />
        ))}

        {/* Holographic Brain */}
        <div className="absolute w-48 h-48 animate-pulse-glow">
          <Brain className="w-full h-full text-primary opacity-50" />
        </div>
        <div
          className="absolute w-48 h-48 animate-spin-slow"
          style={{ animationDirection: 'reverse' }}
        >
          <Brain className="w-full h-full text-accent opacity-30" />
        </div>
      </div>

      <h1 className="mt-8 text-4xl md:text-5xl font-bold font-headline text-shadow-glow tracking-widest text-center">
        Zizo_NeuroCore
      </h1>
      <p className="mt-4 text-sm text-muted-foreground tracking-wider text-center px-4">
        Unlocking Neural Potential Through Intelligence & Immersion
      </p>

      {/* Uplink Loading Bar */}
      <div className="w-64 h-2 mt-12 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div className="h-full bg-gradient-to-r from-primary/50 to-primary animate-uplink"></div>
      </div>
       <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}

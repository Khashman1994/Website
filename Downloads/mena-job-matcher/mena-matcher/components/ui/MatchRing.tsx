// components/ui/MatchRing.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface MatchRingProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function MatchRing({ score, size = 'md' }: MatchRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const sizes = {
    sm: { outer: 60, inner: 50, stroke: 5, text: 'text-lg' },
    md: { outer: 80, inner: 66, stroke: 7, text: 'text-2xl' },
    lg: { outer: 120, inner: 100, stroke: 10, text: 'text-4xl' },
  };

  const { outer, inner, stroke, text } = sizes[size];
  const radius = (outer - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Farbe basierend auf Score
  const getColor = (score: number) => {
    if (score >= 80) return 'rgb(34, 197, 94)'; // Grün
    if (score >= 60) return 'rgb(239, 88, 29)'; // Orange
    if (score >= 40) return 'rgb(245, 158, 11)'; // Gelb
    return 'rgb(168, 162, 158)'; // Grau
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={outer} height={outer} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--neutral-200))"
          strokeWidth={stroke}
        />
        {/* Progress Circle */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${text} font-bold`}>
        <span style={{ color: getColor(score) }}>{Math.round(animatedScore)}%</span>
      </div>
    </div>
  );
}

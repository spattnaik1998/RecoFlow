"use client";

interface CandleFlickerProps {
  size?: number;
  className?: string;
}

export default function CandleFlicker({ size = 40, className = "" }: CandleFlickerProps) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`} style={{ width: size }}>
      {/* Flame */}
      <svg
        width={size * 0.5}
        height={size * 0.75}
        viewBox="0 0 20 30"
        className="candle-flame"
        style={{ marginBottom: -2 }}
      >
        <defs>
          <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#FFF5CC" />
            <stop offset="40%" stopColor="#FFAA00" />
            <stop offset="100%" stopColor="rgba(200,100,20,0)" />
          </radialGradient>
        </defs>
        {/* Outer glow */}
        <ellipse cx="10" cy="20" rx="8" ry="12" fill="rgba(200,169,110,0.12)" />
        {/* Main flame */}
        <path
          d="M10 28 C4 24, 2 18, 5 12 C7 8, 10 4, 10 1 C10 4, 13 8, 15 12 C18 18, 16 24, 10 28Z"
          fill="url(#flameGrad)"
        />
        {/* Inner hot core */}
        <ellipse cx="10" cy="20" rx="3" ry="5" fill="rgba(255,240,180,0.8)" />
      </svg>
      {/* Candle body */}
      <svg width={size * 0.35} height={size * 0.7} viewBox="0 0 14 28">
        <defs>
          <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6B4423" />
            <stop offset="40%" stopColor="#8B5A2B" />
            <stop offset="100%" stopColor="#5A3618" />
          </linearGradient>
        </defs>
        {/* Wax drips */}
        <path d="M4 2 Q3 6 2 8 L2 28 L12 28 L12 8 Q11 6 10 2 Z" fill="url(#candleGrad)" />
        {/* Highlight */}
        <rect x="9" y="3" width="1.5" height="22" fill="rgba(255,255,255,0.07)" rx="0.5" />
        {/* Wick */}
        <line x1="7" y1="0" x2="7" y2="4" stroke="#2A1A0A" strokeWidth="1" />
      </svg>
    </div>
  );
}

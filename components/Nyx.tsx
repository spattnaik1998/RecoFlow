"use client";

import { useState, useEffect } from "react";
import TypewriterText from "./TypewriterText";

interface NyxProps {
  dialogue: string;
  showPortrait?: boolean;
  onDialogueComplete?: () => void;
  className?: string;
  typewriterSpeed?: number;
}

export default function Nyx({
  dialogue,
  showPortrait = true,
  onDialogueComplete,
  className = "",
  typewriterSpeed = 25,
}: NyxProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex gap-4 md:gap-6 items-start ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {showPortrait && (
        <div className="flex-shrink-0">
          <NyxPortrait />
        </div>
      )}
      <div className="flex-1 nyx-speech">
        <TypewriterText
          text={dialogue}
          speed={typewriterSpeed}
          onComplete={onDialogueComplete}
          className="text-parchment-dim font-fell italic leading-relaxed"
        />
      </div>
    </div>
  );
}

// ─── Nyx Portrait SVG ────────────────────────────────────────────────────────

function NyxPortrait() {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        border: "1px solid rgba(200, 169, 110, 0.35)",
        borderRadius: 2,
        overflow: "hidden",
        background: "rgba(10, 6, 3, 0.9)",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 72 72"
        width="72"
        height="72"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="72" height="72" fill="#0A0603" />

        {/* Ambient glow */}
        <radialGradient id="nyxGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="rgba(200,169,110,0.15)" />
          <stop offset="100%" stopColor="rgba(200,169,110,0)" />
        </radialGradient>
        <rect width="72" height="72" fill="url(#nyxGlow)" />

        {/* Robe / cloak */}
        <path
          d="M16 72 L20 48 Q36 55 52 48 L56 72 Z"
          fill="#1A0E08"
          stroke="rgba(200,169,110,0.2)"
          strokeWidth="0.5"
        />
        <path
          d="M22 72 L25 50 Q36 56 47 50 L50 72 Z"
          fill="#110B05"
        />

        {/* Neck */}
        <rect x="31" y="38" width="10" height="12" rx="2" fill="#C8956A" />

        {/* Head */}
        <ellipse cx="36" cy="30" rx="14" ry="16" fill="#C8956A" />

        {/* Hair */}
        <path
          d="M22 25 Q20 14, 36 12 Q52 14, 50 25"
          fill="#1A0A02"
        />
        <path
          d="M22 25 C18 30, 17 40, 19 48 Q22 36, 22 30 Z"
          fill="#1A0A02"
        />
        <path
          d="M50 25 C54 30, 55 40, 53 48 Q50 36, 50 30 Z"
          fill="#1A0A02"
        />
        <path
          d="M22 25 Q24 20, 36 18 Q48 20, 50 25 Q48 16, 36 14 Q24 16, 22 25"
          fill="#231205"
        />

        {/* Eyes */}
        {/* Left eye */}
        <ellipse cx="29" cy="30" rx="4" ry="3" fill="#0D0A07" />
        <ellipse cx="29" cy="30" rx="3" ry="2.2" fill="#1A0E30" />
        <ellipse cx="29" cy="30" rx="2" ry="1.6" fill="#2A1A50" />
        <circle cx="30.2" cy="29" r="0.8" fill="rgba(200,169,110,0.9)" />
        <ellipse cx="29" cy="30" rx="4" ry="3" fill="none" stroke="rgba(200,169,110,0.4)" strokeWidth="0.4" />

        {/* Right eye */}
        <ellipse cx="43" cy="30" rx="4" ry="3" fill="#0D0A07" />
        <ellipse cx="43" cy="30" rx="3" ry="2.2" fill="#1A0E30" />
        <ellipse cx="43" cy="30" rx="2" ry="1.6" fill="#2A1A50" />
        <circle cx="44.2" cy="29" r="0.8" fill="rgba(200,169,110,0.9)" />
        <ellipse cx="43" cy="30" rx="4" ry="3" fill="none" stroke="rgba(200,169,110,0.4)" strokeWidth="0.4" />

        {/* Nose */}
        <path d="M34 34 Q36 37 38 34" fill="none" stroke="rgba(160,100,70,0.6)" strokeWidth="0.7" />

        {/* Lips */}
        <path d="M31 39 Q36 42 41 39" fill="none" stroke="rgba(160,80,60,0.8)" strokeWidth="1" />
        <path d="M32 39 Q36 40.5 40 39" fill="rgba(140,70,50,0.5)" />

        {/* Witch hat */}
        <path
          d="M22 22 L36 2 L50 22 Z"
          fill="#0D0A07"
          stroke="rgba(200,169,110,0.5)"
          strokeWidth="0.8"
        />
        <path
          d="M19 22 L53 22 L51 25 L21 25 Z"
          fill="#110C06"
          stroke="rgba(200,169,110,0.4)"
          strokeWidth="0.6"
        />
        {/* Hat band */}
        <path
          d="M21 22 L51 22 L51 24 L21 24 Z"
          fill="rgba(200,169,110,0.3)"
        />
        {/* Tiny star on hat */}
        <text x="34" y="15" fontSize="5" fill="rgba(200,169,110,0.7)" textAnchor="middle">✦</text>

        {/* Gold collar ornament */}
        <path
          d="M26 44 Q36 48 46 44"
          fill="none"
          stroke="rgba(200,169,110,0.5)"
          strokeWidth="1.5"
        />

        {/* Bottom border decoration */}
        <line x1="8" y1="68" x2="64" y2="68" stroke="rgba(200,169,110,0.2)" strokeWidth="0.5" />
        <text x="36" y="72" fontSize="6" fill="rgba(200,169,110,0.4)" textAnchor="middle">✦ ✦ ✦</text>
      </svg>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CrestLogoProps {
  option: string; // "preset-none" | "preset-school" | "preset-madrasa" | "preset-college" | "preset-star"
  className?: string;
  uploadedData?: string; // base64 representation of a custom image
}

export default function CrestLogo({ option, className = "w-16 h-16", uploadedData }: CrestLogoProps) {
  if (option === 'uploaded' && uploadedData) {
    return (
      <img
        id="uploaded-logo-img"
        src={uploadedData}
        alt="Institution Logo"
        className={`${className} object-contain rounded-md border border-slate-200 p-1`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const baseSvgClass = `${className} text-slate-800 shrink-0`;

  switch (option) {
    case 'preset-school':
      return (
        <svg id="preset-school-svg" viewBox="0 0 100 100" className={baseSvgClass} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Shield Outline */}
          <path d="M50 10 C 75 10, 85 20, 85 45 C 85 75, 50 90, 50 90 C 50 90, 15 75, 15 45 C 15 20, 25 10, 50 10 Z" fill="#f8fafc" strokeWidth="3" />
          {/* Open Book */}
          <path d="M30 52 C40 50, 48 53, 50 56 C52 53, 60 50, 70 52 M30 65 C40 63, 48 66, 50 69 C52 66, 60 63, 70 65" />
          <line x1="50" y1="42" x2="50" y2="69" />
          <path d="M30 42 C40 40, 48 43, 50 46 C52 43, 60 40, 70 42" />
          {/* Torch of Knowledge */}
          <path d="M50 22 L45 32 L55 32 Z" fill="currentColor" />
          <path d="M44 20 C 47 14, 53 14, 56 20 C 53 22, 47 22, 44 20 Z" fill="#ef4444" stroke="#ef4444" />
          {/* Stars */}
          <polygon points="28,32 30,35 34,35 31,37 32,41 28,39 24,41 25,37 22,35 26,35" fill="currentColor" stroke="none" />
          <polygon points="72,32 74,35 78,35 75,37 76,41 72,39 68,41 69,37 66,35 70,35" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'preset-madrasa':
      return (
        <svg id="preset-madrasa-svg" viewBox="0 0 100 100" className={baseSvgClass} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer circle frame */}
          <circle cx="50" cy="50" r="42" strokeWidth="3" fill="#fafaf9" />
          <circle cx="50" cy="50" r="37" strokeWidth="1" strokeDasharray="3,3" />
          {/* Mosque Dome / Mihrab arch */}
          <path d="M35 70 L35 55 C35 43, 42 35, 50 30 C58 35, 65 43, 65 55 L65 70 Z" fill="#f5f5f4" />
          {/* Crescent Moon */}
          <path d="M54 20 C42 20, 36 31, 40 42 C43 32, 53 26, 62 30 C59 24, 57 20, 54 20 Z" fill="currentColor" stroke="none" />
          {/* Islamic Star */}
          <polygon points="50,15 52,18 55,18 53,20 54,23 50,21 46,23 47,20 45,18 48,18" fill="currentColor" stroke="none" />
          {/* Open Quran Stand (Rihal) */}
          <path d="M32 63 L68 63" />
          <path d="M36 55 L50 67 L64 55" />
          <path d="M42 66 L34 76" strokeWidth="3" />
          <path d="M58 66 L66 76" strokeWidth="3" />
        </svg>
      );

    case 'preset-college':
      return (
        <svg id="preset-college-svg" viewBox="0 0 100 100" className={baseSvgClass} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Shield structure with double outline */}
          <path d="M20 15 L80 15 L80 45 C80 65, 50 82, 50 82 C50 82, 20 65, 20 45 Z" strokeWidth="3" fill="#f8fafc" />
          <path d="M25 20 L75 20 L75 44 C75 60, 50 75, 50 75 C50 75, 25 60, 25 44 Z" strokeWidth="1" />
          {/* Ribbon / Banner */}
          <path d="M15 80 L35 84 L50 80 L65 84 L85 80 L80 88 L50 86 L20 88 Z" fill="currentColor" />
          {/* Graduation Cap */}
          <polygon points="50,26 72,34 50,42 28,34" fill="currentColor" stroke="none" />
          <rect x="42" y="40" width="16" height="10" fill="currentColor" stroke="none" />
          <path d="M72 34 L72 50 C72 50, 74 53, 76 48" strokeWidth="2" />
          {/* Laurel Wreath twigs */}
          <path d="M28 65 C26 55, 30 48, 36 45" />
          <path d="M72 65 C74 55, 70 48, 64 45" />
          {/* Inner divider line */}
          <line x1="50" y1="50" x2="50" y2="72" />
        </svg>
      );

    case 'preset-star':
      return (
        <svg id="preset-star-svg" viewBox="0 0 100 100" className={baseSvgClass} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Double ring */}
          <circle cx="50" cy="50" r="40" strokeWidth="2.5" fill="#f8fafc" />
          <circle cx="50" cy="50" r="35" strokeWidth="1" />
          {/* Five Pointed Star Emblem */}
          <polygon points="50,20 58,38 78,38 62,50 68,68 50,56 32,68 38,50 22,38 42,38" fill="currentColor" strokeWidth="2" />
          {/* Radiant spikes */}
          <line x1="50" y1="8" x2="50" y2="15" />
          <line x1="50" y1="85" x2="50" y2="92" />
          <line x1="8" y1="50" x2="15" y2="50" />
          <line x1="85" y1="50" x2="92" y2="50" />
        </svg>
      );

    default:
      return null;
  }
}

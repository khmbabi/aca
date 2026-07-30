import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, showText = true, size = 'md' }) => {
  const sizes = {
    sm: { box: 'h-10 w-10', text: 'text-xl', subtext: 'text-[7.5px]' },
    md: { box: 'h-14 w-14', text: 'text-2xl', subtext: 'text-[9px]' },
    lg: { box: 'h-24 w-24', text: 'text-5xl', subtext: 'text-[12px]' },
  };

  return (
    <div className={cn('flex items-center gap-3 group', className)}>
      {/* 3-D Icon Shell */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-[28%] overflow-hidden aca-logo-icon',
          sizes[size].box
        )}
        style={{
          background: 'linear-gradient(145deg, #1a4a2e 0%, #0a2218 100%)',
          boxShadow: `
            0 1px 0 0 rgba(255,255,255,0.10) inset,
            0 -1px 0 0 rgba(0,0,0,0.45) inset,
            5px 10px 28px rgba(0,0,0,0.55),
            0 2px 6px rgba(0,0,0,0.35),
            0 0 0 1px rgba(255,255,255,0.06)
          `,
        }}
      >
        {/* Top-left gloss highlight */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 50%)',
            borderRadius: 'inherit',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Soft green glow underneath */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-25%',
            left: '10%',
            right: '10%',
            height: '35%',
            borderRadius: '50%',
            background: 'rgba(74,222,128,0.10)',
            filter: 'blur(6px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Neural-tree SVG */}
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 w-full h-full"
          style={{ padding: '8%' }}
          aria-hidden
        >
          <defs>
            <linearGradient id="acaTrunk" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="acaBranch" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="acaGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Trunk */}
          <path d="M50 88 V62" stroke="url(#acaTrunk)" strokeWidth="6" strokeLinecap="round" />
          <path d="M50 88 V62" stroke="rgba(255,255,255,0.14)" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="50" cy="89" rx="13" ry="3.5" fill="rgba(74,222,128,0.14)" />

          {/* Left branches */}
          <path d="M50 62 L32 50 L20 48 L16 36 L27 26 L50 32" fill="none" stroke="url(#acaBranch)" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M32 50 L34 40 L44 36" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />

          {/* Right branches */}
          <path d="M50 62 L68 50 L80 48 L84 36 L73 26 L50 32" fill="none" stroke="url(#acaBranch)" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M68 50 L66 40 L56 36" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />

          {/* Top stem + tips */}
          <path d="M50 32 V17" stroke="url(#acaBranch)" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 17 L39 12 M50 17 L61 12" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />

          {/* Green synapse nodes */}
          <circle cx="16" cy="36" r="3" fill="#86efac" filter="url(#acaGlow)" />
          <circle cx="84" cy="36" r="3" fill="#86efac" filter="url(#acaGlow)" />
          <circle cx="27" cy="26" r="3" fill="#86efac" filter="url(#acaGlow)" />
          <circle cx="73" cy="26" r="3" fill="#86efac" filter="url(#acaGlow)" />
          {/* Gold tip nodes */}
          <circle cx="39" cy="12" r="3.2" fill="#fbbf24" filter="url(#acaGlow)" />
          <circle cx="61" cy="12" r="3.2" fill="#fbbf24" filter="url(#acaGlow)" />

          {/* AI core chip */}
          <rect x="44" y="29" width="12" height="10" rx="2" fill="#0d1f10" stroke="#4ade80" strokeWidth="1" />
          <path d="M47 34 h6 M50 31.5 v5" stroke="#4ade80" strokeWidth="0.7" />

          {/* Specular shine */}
          <ellipse cx="34" cy="42" rx="6" ry="3" fill="rgba(255,255,255,0.06)" transform="rotate(-30,34,42)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-display font-black tracking-tighter leading-none uppercase text-gray-900 dark:text-white', sizes[size].text)}>
            ACA<span className="text-primary-600">.</span>Platform
          </span>
          <span className={cn('font-bold uppercase tracking-[0.24em] leading-none mt-1.5 text-gray-400 dark:text-gray-500', sizes[size].subtext)}>
            Agricultural Crop Analysis
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

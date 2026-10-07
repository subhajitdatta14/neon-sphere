import React from 'react';
import { sounds } from '../sound/SoundManager';

interface ArcadeButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'normal' | 'large' | 'compact';
  variant?: 'cyan' | 'magenta' | 'violet' | 'yellow';
  disabled?: boolean;
}

export const ArcadeButton: React.FC<ArcadeButtonProps> = ({
  onClick,
  children,
  className = '',
  size = 'normal',
  variant = 'cyan',
  disabled = false,
}) => {
  const colors = {
    cyan: {
      border: '#00E5FF',
      text: 'text-[#E0FFFF]',
      hoverText: 'group-hover:text-[#00E5FF]',
      glow: 'group-hover:neon-glow-cyan',
      shadow: 'drop-shadow-[0_0_8px_rgba(0,229,255,0.45)]',
    },
    magenta: {
      border: '#FF2BD6',
      text: 'text-[#FFE4FB]',
      hoverText: 'group-hover:text-[#FF2BD6]',
      glow: 'group-hover:neon-glow-magenta',
      shadow: 'drop-shadow-[0_0_8px_rgba(255,43,214,0.45)]',
    },
    violet: {
      border: '#6C2BFF',
      text: 'text-[#FFFFFF]',
      hoverText: 'group-hover:text-[#9F75FF]',
      glow: 'group-hover:neon-glow-violet',
      shadow: 'drop-shadow-[0_0_8px_rgba(108,43,255,0.45)]',
    },
    yellow: {
      border: '#FFE600',
      text: 'text-[#FFE600]',
      hoverText: 'group-hover:text-white',
      glow: 'group-hover:neon-glow-yellow',
      shadow: 'drop-shadow-[0_0_8px_rgba(255,230,0,0.45)]',
    },
  }[variant];

  const sizeClasses = {
    compact: 'h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm tracking-wider',
    normal: 'h-11 sm:h-13 md:h-14 px-5 sm:px-8 text-xs sm:text-sm md:text-base tracking-widest',
    large: 'h-12 sm:h-14 md:h-16 px-6 sm:px-10 text-sm sm:text-base md:text-lg tracking-widest',
  }[size];

  const handleClick = () => {
    if (disabled) return;
    sounds.playButtonClick();
    onClick();
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      sounds.playButtonHover();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center font-orbitron font-black uppercase transition-all duration-150 active:scale-[0.98] active:brightness-90 focus:outline-none select-none disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${sizeClasses} ${className}`}
      style={{
        clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
        backgroundColor: 'rgba(5, 2, 13, 0.92)',
      }}
    >
      {/* Sci-Fi Octagonal Border SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polygon
          points="8,0 92,0 100,16 100,84 92,100 8,100 0,84 0,16"
          fill="none"
          stroke={colors.border}
          strokeWidth="2.8"
          vectorEffect="non-scaling-stroke"
          className={`transition-all duration-200 group-hover:brightness-125 ${colors.shadow}`}
        />
      </svg>

      {/* Decorative chevron brackets */}
      <span className="absolute left-3.5 text-xs opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: colors.border }}>
        ◀
      </span>

      {/* Button Text */}
      <span
        className={`relative z-10 ${colors.text} ${colors.hoverText} transition-all duration-150 group-hover:brightness-125 ${colors.glow}`}
      >
        {children}
      </span>

      <span className="absolute right-3.5 text-xs opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all" style={{ color: colors.border }}>
        ▶
      </span>

      {/* Subtle hover background highlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-150 pointer-events-none"
        style={{ backgroundColor: colors.border }}
      />
    </button>
  );
};

import React from 'react';

interface HeaderHUDProps {
  score: number;
  highScore: number;
  speedKmh: number;
  countdownText: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenMenu: () => void;
  gameState: string;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  score,
  highScore,
  speedKmh,
  countdownText,
  onOpenMenu,
  gameState,
}) => {
  const displaySpeed = gameState === 'PLAYING' ? speedKmh : 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-2 sm:p-4 md:p-5 select-none">
      {/* Top Header Row */}
      <div className="flex items-start justify-between w-full max-w-7xl mx-auto gap-1 sm:gap-3">
        {/* Left: Speedometer in Electric Cyan */}
        <div className="relative pointer-events-auto flex items-center">
          <div
            onClick={onOpenMenu}
            title="Menu / Settings"
            className="group relative cursor-pointer flex items-center justify-center px-2.5 py-1.5 sm:px-6 sm:py-2.5 md:px-7 md:py-3 min-w-[76px] sm:min-w-[130px] md:min-w-[160px]"
            style={{
              clipPath: 'polygon(0% 0%, calc(100% - 14px) 0%, 100% 14px, 100% 100%, 14px 100%, 0% calc(100% - 14px))',
              backgroundColor: 'rgba(5, 2, 13, 0.92)',
            }}
          >
            {/* SVG border frame with corner sci-fi notches */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 180 56"
            >
              {/* Outer Cyan Border */}
              <polygon
                points="1,1 156,1 179,24 179,55 24,55 1,32"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.8"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]"
              />
              <line x1="20" y1="1" x2="140" y2="1" stroke="#00E5FF" strokeWidth="4" />
              <polyline points="6,12 1,12 1,1" fill="none" stroke="#00E5FF" strokeWidth="3" />
              <polyline points="174,44 179,44 179,55" fill="none" stroke="#00E5FF" strokeWidth="3" />
            </svg>

            {/* Speed Text */}
            <div className="relative z-10 flex items-center gap-1 font-orbitron font-black text-xs sm:text-lg md:text-xl tracking-wider text-[#00E5FF] neon-glow-cyan">
              <span>{displaySpeed}</span>
              <span className="text-[8px] sm:text-xs md:text-sm font-bold opacity-90">KM/H</span>
            </div>
          </div>
        </div>

        {/* Center: SCORE Panel (Cyan frame, white title, arcade yellow score) */}
        <div className="relative flex flex-col items-center">
          <div
            className="relative flex flex-col items-center justify-center px-3 py-1 sm:px-8 sm:py-2 md:px-12 md:py-2.5 min-w-[95px] sm:min-w-[170px] md:min-w-[240px]"
            style={{
              clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 0%, calc(100% - 16px) 100%, 16px 100%, 0% 0%)',
              backgroundColor: 'rgba(5, 2, 13, 0.94)',
            }}
          >
            {/* Trapezoidal Sci-Fi Frame SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 270 82"
            >
              <polygon
                points="20,1 250,1 269,1 245,81 25,81 1,1"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.8"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]"
              />
              <polyline points="1,14 1,1 28,1" fill="none" stroke="#00E5FF" strokeWidth="4" />
              <polyline points="242,1 269,1 269,14" fill="none" stroke="#00E5FF" strokeWidth="4" />
              <polyline points="18,68 25,81 48,81" fill="none" stroke="#00E5FF" strokeWidth="3" />
              <polyline points="222,81 245,81 252,68" fill="none" stroke="#00E5FF" strokeWidth="3" />
            </svg>

            {/* Label: SCORE in White */}
            <span className="relative z-10 font-orbitron font-extrabold text-[8px] sm:text-xs tracking-[0.2em] text-white uppercase mb-0.5 drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">
              SCORE
            </span>

            {/* Score Number in Arcade Yellow (#FFE600) */}
            <span className="relative z-10 font-orbitron font-black text-xl sm:text-3xl md:text-5xl text-[#FFE600] neon-glow-yellow tabular-nums tracking-wider leading-none">
              {score}
            </span>
          </div>
        </div>

        {/* Right: Record Panel [ RECORD 1540 ] in Cyberpunk Synthwave Frame */}
        <div className="relative pointer-events-auto flex items-center justify-end">
          <div
            title="All-Time Record Score"
            className="relative flex items-center justify-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-2.5 md:px-7 md:py-3 min-w-[76px] sm:min-w-[130px] md:min-w-[160px]"
            style={{
              clipPath: 'polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px)',
              backgroundColor: 'rgba(5, 2, 13, 0.92)',
            }}
          >
            {/* Symmetrical Sci-Fi Polygon Border SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 180 56"
            >
              <polygon
                points="24,1 179,1 179,32 156,55 1,55 1,24"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.8"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]"
              />
              <line x1="40" y1="1" x2="160" y2="1" stroke="#00E5FF" strokeWidth="4" />
              <polyline points="174,12 179,12 179,1" fill="none" stroke="#00E5FF" strokeWidth="3" />
              <polyline points="6,44 1,44 1,55" fill="none" stroke="#00E5FF" strokeWidth="3" />
            </svg>

            {/* Record Text & Number */}
            <div className="relative z-10 flex items-center gap-1 sm:gap-2 font-orbitron font-black text-xs sm:text-sm md:text-base tracking-wider">
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-[#00E5FF]/80 uppercase tracking-widest">RECORD</span>
              <span className="text-xs sm:text-base md:text-xl text-[#FFE600] neon-glow-yellow tabular-nums font-black">
                {highScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Countdown Display in White-Cyan */}
      {countdownText && (
        <div className="self-center my-auto">
          <div className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-orbitron font-black text-white neon-glow-cyan tracking-widest animate-pulse select-none">
            {countdownText}
          </div>
        </div>
      )}
    </div>
  );
};

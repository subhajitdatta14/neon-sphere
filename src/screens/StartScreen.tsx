import React, { useState, useRef, useEffect } from 'react';
import { ArcadeButton } from '../components/ArcadeButton';
import { X } from 'lucide-react';

interface StartScreenProps {
  highScore?: number;
  onPlay: () => void;
  onOpenLeaderboard?: () => void;
  onOpenHowToPlay: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onPlay,
  onOpenHowToPlay,
}) => {
  const [showDeveloperCard, setShowDeveloperCard] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const handleTitleClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 4) {
      setShowDeveloperCard(true);
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    } else {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  const handleTouchStart = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setShowDeveloperCard(true);
      touchTimerRef.current = null;
    }, 3000);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-8 md:p-10 select-none bg-[#05020D]/75 overflow-y-auto max-h-[100dvh]">
      {/* Top spacing */}
      <div className="w-full max-w-7xl mx-auto h-2 sm:h-6 shrink-0" />

      {/* Main Title Section */}
      <div className="flex flex-col items-center text-center my-auto py-4">
        <h1
          onClick={handleTitleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-black text-white neon-glow-cyan tracking-widest uppercase mb-6 sm:mb-8 md:mb-10 drop-shadow-[0_0_15px_#00E5FF] cursor-pointer active:scale-[0.99] transition-transform select-none"
        >
          NEON SPHERE
        </h1>

        {/* Action Buttons with subtle color hierarchy */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-xs md:max-w-sm">
          <ArcadeButton onClick={onPlay} size="large" variant="cyan" className="w-full">
            PLAY
          </ArcadeButton>

          <ArcadeButton onClick={onOpenHowToPlay} size="normal" variant="magenta" className="w-full">
            HOW TO PLAY
          </ArcadeButton>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="w-full max-w-7xl mx-auto h-2 sm:h-6 shrink-0" />

      {/* Developer Card Modal */}
      {showDeveloperCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-[#05020D]/95 border-2 border-[#00E5FF] p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(0,229,255,0.5)]"
            style={{
              clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)',
            }}
          >
            {/* Small Exit Button Above */}
            <button
              type="button"
              onClick={() => setShowDeveloperCard(false)}
              aria-label="Exit"
              className="absolute top-3 right-3 p-1.5 text-[#00E5FF] hover:text-white border border-[#00E5FF]/60 hover:border-white bg-[#05020D] hover:bg-[#00E5FF]/20 transition-all cursor-pointer"
              style={{
                clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)',
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            {/* Card Content */}
            <div className="flex flex-col items-center pt-2">
              <span className="text-[10px] sm:text-xs font-orbitron font-bold tracking-[0.3em] text-[#00E5FF]/70 uppercase mb-3">
                CREDITS
              </span>

              <h2 className="text-base sm:text-xl md:text-2xl font-orbitron font-black text-white neon-glow-cyan tracking-wider uppercase mb-3 drop-shadow-[0_0_12px_#00E5FF]">
                DEVELOPED BY SUBHAJIT DATTA
              </h2>

              <div className="h-0.5 w-16 bg-[#00E5FF]/50 my-2" />

              <p className="text-xs sm:text-sm font-orbitron font-bold text-[#FFE600] tracking-[0.25em] uppercase neon-glow-yellow mt-1">
                2ND OCTOBER 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

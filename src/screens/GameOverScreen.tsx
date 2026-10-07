import React from 'react';
import { ArcadeButton } from '../components/ArcadeButton';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onPlayAgain: () => void;
  onOpenLeaderboard?: () => void;
  onBackToMenu: () => void;
  onSaveScore?: (name: string) => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  onPlayAgain,
  onBackToMenu,
}) => {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#05020D]/92 backdrop-blur-xs select-none overflow-y-auto max-h-[100dvh]">
      <div className="flex flex-col items-center max-w-md w-full text-center py-2">
        {/* Title: WHITE with MAGENTA glow */}
        <h1 className="text-2xl sm:text-5xl md:text-6xl font-orbitron font-black text-white neon-glow-white-magenta tracking-wider sm:tracking-widest uppercase mb-2 sm:mb-4 drop-shadow-[0_0_15px_#FF2BD6] whitespace-nowrap">
          GAME OVER
        </h1>

        {/* Score label: #00E5FF */}
        <p className="text-[11px] sm:text-xs md:text-sm font-orbitron font-bold tracking-[0.25em] text-[#00E5FF] uppercase mb-1 sm:mb-2">
          YOUR SCORE:
        </p>

        {/* Score number: #FFE600 */}
        <div className="text-5xl sm:text-7xl md:text-8xl font-orbitron font-black text-[#FFE600] neon-glow-yellow tracking-wider mb-3 sm:mb-4 tabular-nums">
          {score}
        </div>

        {/* New Record Banner if applicable */}
        {isNewRecord && (
          <div className="text-xs sm:text-sm font-orbitron font-bold text-[#FFE600] tracking-widest bg-[#FFE600]/15 px-4 py-1.5 sm:px-5 sm:py-2 border border-[#FFE600] mb-4 sm:mb-6 animate-pulse">
            ★ NEW HIGH SCORE! ★
          </div>
        )}

        {/* Two Action Buttons:
            PLAY AGAIN: cyan border + white/cyan text
            BACK: magenta border + white/magenta text */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[280px] sm:max-w-xs md:max-w-sm mt-1 sm:mt-2">
          <ArcadeButton onClick={onPlayAgain} size="large" variant="cyan" className="w-full">
            PLAY AGAIN
          </ArcadeButton>

          <ArcadeButton onClick={onBackToMenu} size="normal" variant="magenta" className="w-full">
            BACK
          </ArcadeButton>
        </div>
      </div>
    </div>
  );
};

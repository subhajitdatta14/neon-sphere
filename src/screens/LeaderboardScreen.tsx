import React from 'react';
import { LeaderboardEntry } from '../types';
import { ArcadeButton } from '../components/ArcadeButton';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ entries, onBack }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-8 md:p-10 select-none bg-[#05020D]/95 overflow-y-auto max-h-[100dvh]">
      {/* Title Header */}
      <div className="flex flex-col items-center text-center mt-1 sm:mt-2">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-orbitron font-black text-white neon-glow-cyan tracking-widest uppercase mb-1 sm:mb-2">
          LEADERBOARD
        </h2>
        <p className="text-[10px] sm:text-xs font-orbitron font-bold tracking-widest text-[#6C2BFF] uppercase">
          RECENT SESSION SCORES
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-xl my-2 sm:my-4 overflow-y-auto max-h-[55dvh] sm:max-h-[60vh] border border-[#00E5FF]/40 bg-[#05020D]/90">
        <div className="grid grid-cols-12 gap-1 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-[#00E5FF]/30 text-[10px] sm:text-xs font-orbitron font-bold tracking-widest text-[#00E5FF] uppercase">
          <div className="col-span-3 sm:col-span-2 text-center">RANK</div>
          <div className="col-span-5 sm:col-span-5">RUN</div>
          <div className="col-span-4 sm:col-span-3 text-right">SCORE</div>
          <div className="col-span-2 text-right hidden sm:block">TIME</div>
        </div>

        {entries.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="text-xs sm:text-sm font-orbitron text-[#00E5FF]/70 tracking-widest uppercase mb-1">
              NO RECORDS YET IN THIS SESSION
            </p>
            <p className="text-[11px] font-orbitron text-white/50 tracking-wider">
              SURVIVE HAZARDS TO CLAIM RANK 1!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#6C2BFF]/20">
            {entries.map((entry, index) => {
              const isTop3 = index < 3;
              const rankLabel = index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `${index + 1}`;

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 items-center font-orbitron text-xs sm:text-sm transition-colors hover:bg-[#00E5FF]/10 ${
                    isTop3 ? 'text-white font-bold' : 'text-white/80'
                  }`}
                >
                  <div className="col-span-3 sm:col-span-2 text-center font-orbitron text-[11px] sm:text-xs text-[#00E5FF]">
                    {rankLabel}
                  </div>
                  <div className="col-span-5 sm:col-span-5 font-orbitron tracking-wider truncate text-[#E0FFFF]">
                    {entry.name}
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-right font-orbitron font-bold text-xs sm:text-sm text-[#FFE600] neon-glow-yellow tabular-nums">
                    {entry.score}
                  </div>
                  <div className="col-span-2 text-right text-xs text-[#6C2BFF] hidden sm:block">
                    {entry.date || '-'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="w-full max-w-[280px] sm:max-w-xs mb-1 sm:mb-2">
        <ArcadeButton onClick={onBack} size="normal" variant="cyan" className="w-full">
          BACK
        </ArcadeButton>
      </div>
    </div>
  );
};

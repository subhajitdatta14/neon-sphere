import React from 'react';
import { ArcadeButton } from '../components/ArcadeButton';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-8 md:p-10 select-none bg-[#05020D]/95 overflow-y-auto max-h-[100dvh]">
      {/* Title */}
      <div className="flex flex-col items-center text-center mt-1 sm:mt-2">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-orbitron font-black text-white neon-glow-cyan tracking-widest uppercase mb-1 sm:mb-2">
          HOW TO PLAY
        </h2>
        <p className="text-[10px] sm:text-xs font-orbitron font-bold tracking-widest text-[#00E5FF]/70 uppercase">
          MISSION PROTOCOL
        </p>
      </div>

      {/* Instructions Content */}
      <div className="w-full max-w-lg my-2 sm:my-auto space-y-2.5 sm:space-y-4 text-left overflow-y-auto max-h-[60dvh] sm:max-h-none pr-1">
        {/* Step 1: Controls in Electric Cyan */}
        <div className="p-3 sm:p-4 border border-[#00E5FF]/50 bg-[#05020D]/90">
          <h3 className="text-xs sm:text-sm font-orbitron font-bold text-[#00E5FF] uppercase mb-1.5 sm:mb-2">
            01. CONTROLS
          </h3>
          <div className="space-y-1 text-[11px] sm:text-xs font-orbitron tracking-wide text-white/90">
            <p>• <span className="text-[#00E5FF] font-bold">DESKTOP / LAPTOP:</span> Press <span className="border border-[#00E5FF] px-1 py-0.5 text-[#00E5FF]">[A]</span> or <span className="border border-[#00E5FF] px-1 py-0.5 text-[#00E5FF]">[◄]</span> to steer left, <span className="border border-[#00E5FF] px-1 py-0.5 text-[#00E5FF]">[D]</span> or <span className="border border-[#00E5FF] px-1 py-0.5 text-[#00E5FF]">[►]</span> to steer right.</p>
            <p>• <span className="text-[#00E5FF] font-bold">MOBILE / TABLET:</span> Tap or hold the left or right half of your screen.</p>
          </div>
        </div>

        {/* Step 2: Obstacles in Hot Magenta */}
        <div className="p-3 sm:p-4 border border-[#FF2BD6]/60 bg-[#05020D]/90">
          <h3 className="text-xs sm:text-sm font-orbitron font-bold text-[#FF2BD6] uppercase mb-1.5 sm:mb-2 neon-glow-magenta">
            02. MAGENTA HAZARDS (#FF2BD6)
          </h3>
          <p className="text-[11px] sm:text-xs font-orbitron tracking-wide text-white/90">
            Hot magenta cubes with X cross-bracing are lethal on contact. Weave through open grid lanes to safely navigate around them.
          </p>
        </div>

        {/* Step 3: Survival in Deep Violet */}
        <div className="p-3 sm:p-4 border border-[#6C2BFF]/60 bg-[#05020D]/90">
          <h3 className="text-xs sm:text-sm font-orbitron font-bold text-[#6C2BFF] uppercase mb-1.5 sm:mb-2">
            03. TRACK PERIMETER
          </h3>
          <p className="text-[11px] sm:text-xs font-orbitron tracking-wide text-white/90">
            Keep your sphere on the digital grid highway. Exceeding the outer boundary causes an immediate fall into the dark abyss.
          </p>
        </div>
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

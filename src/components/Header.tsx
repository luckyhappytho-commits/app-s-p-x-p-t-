import React from 'react';
import { GraduationCap, Volume2, VolumeX, Trophy } from 'lucide-react';

interface HeaderProps {
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenLeaderboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ soundOn, onToggleSound, onOpenLeaderboard }) => {
  return (
    <header className="w-full bg-[#161B22] border-b border-[#1E293B] py-3 px-6 flex justify-between items-center text-white z-20 shadow-xl">
      <div className="flex items-center space-x-3">
        <div className="bg-[#1E293B] border border-[#334155] text-[#38BDF8] p-2.5 rounded-xl font-bold text-xl flex items-center justify-center shadow-md">
          <GraduationCap className="w-6 h-6 text-[#38BDF8]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#E2E8F0] flex items-center gap-2">
            ENGLISH TENSE MASTER
            <span className="bg-[#1E293B] text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[#334155] text-[#38BDF8] hidden md:inline-block">v2.0</span>
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] font-medium">
            Grade 5 Sentence Builder & Grammar Challenge
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Audio Toggle Button */}
        <button
          id="soundToggleBtn"
          onClick={onToggleSound}
          className="bg-[#1E293B] hover:bg-[#334155] active:scale-95 text-[#38BDF8] font-bold px-3.5 py-2 rounded-xl border border-[#334155] flex items-center space-x-2 transition shadow cursor-pointer text-xs md:text-sm"
        >
          {soundOn ? (
            <>
              <Volume2 className="w-4 h-4 text-[#38BDF8]" />
              <span className="hidden sm:inline">Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#64748B]" />
              <span className="hidden sm:inline text-[#64748B]">Sound OFF</span>
            </>
          )}
        </button>

        {/* Leaderboard Quick View Button */}
        <button
          onClick={onOpenLeaderboard}
          className="bg-[#1E293B] hover:bg-[#334155] active:scale-95 text-[#FFBD2E] font-bold px-3.5 py-2 rounded-xl border border-[#334155] flex items-center space-x-2 transition shadow cursor-pointer text-xs md:text-sm"
        >
          <Trophy className="w-4 h-4 text-[#FFBD2E]" />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>
      </div>
    </header>
  );
};

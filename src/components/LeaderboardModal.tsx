import React, { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { LeaderboardRecord } from '../types';
import { getLeaderboard, clearLeaderboard } from '../utils/leaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecords(getLeaderboard());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    clearLeaderboard();
    setRecords([]);
  };

  return (
    <div className="fixed inset-0 bg-[#0F1115]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161B22] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#1E293B] relative animate-pop">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748B] hover:text-[#E2E8F0] text-2xl font-bold w-9 h-9 rounded-xl flex items-center justify-center bg-[#0F1115] hover:bg-[#1E293B] transition cursor-pointer border border-[#1E293B]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-[#1E293B] border border-[#334155] text-[#FFBD2E] p-2.5 rounded-xl font-bold shadow">
            <Trophy className="w-6 h-6 text-[#FFBD2E]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#E2E8F0]">Class Hall of Fame</h3>
            <p className="text-xs text-[#64748B] font-semibold">Top score records saved on this device</p>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-xl border border-[#1E293B] mb-4 bg-[#0F1115]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1E293B] text-[#38BDF8] text-xs font-bold uppercase sticky top-0 border-b border-[#334155]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Score</th>
                <th className="p-3">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-sm font-semibold text-[#94A3B8]">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-[#64748B]">
                    No score records found yet!
                  </td>
                </tr>
              ) : (
                records.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-[#161B22]' : 'bg-[#0F1115]'}>
                    <td className="p-3 font-bold text-[#E2E8F0]">
                      {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                    </td>
                    <td className="p-3 font-bold text-[#E2E8F0]">{item.name}</td>
                    <td className="p-3 font-extrabold text-[#FFBD2E]">{item.score}</td>
                    <td className="p-3 font-bold text-[#22C55E]">{item.accuracy}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleClear}
            className="text-xs text-[#F43F5E] hover:text-[#FB7185] font-bold cursor-pointer transition"
          >
            Clear Records
          </button>
          <button
            onClick={onClose}
            className="bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0F1115] font-extrabold px-6 py-2 rounded-xl border-b-2 border-[#0284C7] cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

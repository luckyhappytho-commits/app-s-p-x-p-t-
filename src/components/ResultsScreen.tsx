import React, { useEffect, useState, useRef } from 'react';
import { Award, RotateCcw, Trophy, CloudUpload, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playVictoryFanfare } from '../utils/audio';
import { saveLeaderboardRecord, sendResultsToGoogleSheets } from '../utils/leaderboard';

interface ResultsScreenProps {
  studentName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  onRestartGame: () => void;
  onOpenLeaderboard: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  studentName,
  score,
  correctCount,
  totalQuestions,
  onRestartGame,
  onOpenLeaderboard
}) => {
  const [sheetStatus, setSheetStatus] = useState<'sending' | 'success' | 'local'>('sending');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  let rankBadge = "Grammar Rookie";
  if (accuracy >= 90) rankBadge = "English Grandmaster 🏆";
  else if (accuracy >= 75) rankBadge = "Tense Expert ⭐";
  else if (accuracy >= 60) rankBadge = "Grammar Scholar 📘";

  let congratsMessage = "Good Effort! Keep practicing to get 100%! 💪";
  if (accuracy === 100) {
    congratsMessage = "PERFECT SCORE! Outstanding Grammar Skills! 🌟";
  } else if (accuracy >= 80) {
    congratsMessage = "Fantastic Work! You mastered these tenses! 🎉";
  }

  useEffect(() => {
    playVictoryFanfare();

    // Trigger canvas-confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    // Save record to local storage
    saveLeaderboardRecord({
      name: studentName,
      score,
      accuracy,
      date: new Date().toLocaleDateString()
    });

    // Send results to Google Sheets
    sendResultsToGoogleSheets(studentName, score, (status) => {
      setSheetStatus(status);
    });
  }, [studentName, score, accuracy]);

  return (
    <div className="w-full max-w-2xl bg-[#161B22] rounded-2xl p-6 md:p-8 shadow-2xl border border-[#1E293B] text-center animate-pop relative z-20 my-auto">
      <div className="inline-block bg-[#1E293B] border border-[#334155] text-[#38BDF8] px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-3 shadow-sm">
        Course Completed!
      </div>

      <h2 className="text-3xl md:text-4xl font-black text-[#E2E8F0] mb-1">GREAT JOB!</h2>
      <p className="text-[#38BDF8] font-bold text-lg mb-6">{congratsMessage}</p>

      {/* Certificate Card */}
      <div className="bg-[#0F1115] border border-[#1E293B] rounded-2xl p-6 mb-6 shadow-inner relative overflow-hidden">
        <div className="absolute top-2 right-2 opacity-10 text-[#38BDF8] pointer-events-none">
          <Award className="w-32 h-32" />
        </div>

        <div className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-1">
          Official Score Certificate
        </div>
        <div className="text-2xl md:text-3xl font-black text-[#E2E8F0] mb-1 underline decoration-[#38BDF8]">
          {studentName}
        </div>

        {/* Google Sheets status banner */}
        <div className="text-xs font-bold mb-4 flex items-center justify-center">
          {sheetStatus === 'sending' && (
            <span className="text-[#38BDF8] flex items-center gap-1.5">
              <CloudUpload className="w-4 h-4 text-[#38BDF8] animate-bounce" /> Sending result to teacher's sheet...
            </span>
          )}
          {sheetStatus === 'success' && (
            <span className="text-[#22C55E] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Results successfully sent to Google Sheets!
            </span>
          )}
          {sheetStatus === 'local' && (
            <span className="text-[#FFBD2E] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#FFBD2E]" /> Saved locally
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-[#161B22] p-3 rounded-xl border border-[#1E293B] shadow-sm">
            <div className="text-[10px] text-[#64748B] font-bold uppercase">Final Score</div>
            <div className="text-2xl md:text-3xl font-black text-[#FFBD2E]">{score}</div>
          </div>
          <div className="bg-[#161B22] p-3 rounded-xl border border-[#1E293B] shadow-sm">
            <div className="text-[10px] text-[#64748B] font-bold uppercase">Accuracy</div>
            <div className="text-2xl md:text-3xl font-black text-[#22C55E]">{accuracy}%</div>
          </div>
          <div className="bg-[#161B22] p-3 rounded-xl border border-[#1E293B] shadow-sm">
            <div className="text-[10px] text-[#64748B] font-bold uppercase">Correct</div>
            <div className="text-2xl md:text-3xl font-black text-[#38BDF8]">
              {correctCount}/{totalQuestions}
            </div>
          </div>
          <div className="bg-[#161B22] p-3 rounded-xl border border-[#1E293B] shadow-sm">
            <div className="text-[10px] text-[#64748B] font-bold uppercase">Rank Badge</div>
            <div className="text-base md:text-lg font-black text-[#C678DD]">{rankBadge}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onRestartGame}
          className="bg-[#22C55E] hover:bg-[#4ADE80] active:translate-y-0.5 text-[#0F1115] font-extrabold text-lg py-3.5 rounded-xl border-b-4 border-[#15803D] shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="bg-[#38BDF8] hover:bg-[#7DD3FC] active:translate-y-0.5 text-[#0F1115] font-extrabold text-lg py-3.5 rounded-xl border-b-4 border-[#0284C7] shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Trophy className="w-5 h-5" />
          <span>VIEW LEADERBOARD</span>
        </button>
      </div>
    </div>
  );
};

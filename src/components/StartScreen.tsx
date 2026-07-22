import React, { useState } from 'react';
import { UserCheck, ListChecks, Clock, Play, AlertCircle } from 'lucide-react';

interface StartScreenProps {
  onStartGame: (name: string, questionCount: number, timerMode: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [studentName, setStudentName] = useState('');
  const [questionCount, setQuestionCount] = useState(50);
  const [timerMode, setTimerMode] = useState(30);
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onStartGame(studentName.trim(), questionCount, timerMode);
  };

  return (
    <div className="w-full max-w-2xl bg-[#161B22] rounded-2xl p-6 md:p-8 shadow-2xl border border-[#1E293B] text-center animate-pop my-auto">
      <div className="inline-block bg-[#1E293B] border border-[#334155] text-[#38BDF8] px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-4 shadow-sm">
        Grade 5 Interactive Practice
      </div>

      <h2 className="text-3xl md:text-4xl font-extrabold text-[#E2E8F0] mb-2 tracking-tight">
        Welcome, Young Master!
      </h2>
      <p className="text-[#94A3B8] mb-6 text-base md:text-lg">
        Arrange the scrambled words to make correct English sentences.
      </p>

      {/* Covered Tenses Badges */}
      <div className="mb-6 bg-[#0F1115] p-4 rounded-xl border border-[#1E293B]">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">
          6 Tenses Included (50 Sentences Total):
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="bg-[#1E293B] border border-[#334155] text-[#38BDF8] text-xs font-bold px-3 py-1.5 rounded-lg">
            Present Simple
          </span>
          <span className="bg-[#1E293B] border border-[#334155] text-[#22C55E] text-xs font-bold px-3 py-1.5 rounded-lg">
            Present Continuous
          </span>
          <span className="bg-[#1E293B] border border-[#334155] text-[#C678DD] text-xs font-bold px-3 py-1.5 rounded-lg">
            Past Simple
          </span>
          <span className="bg-[#1E293B] border border-[#334155] text-[#F43F5E] text-xs font-bold px-3 py-1.5 rounded-lg">
            Past Continuous
          </span>
          <span className="bg-[#1E293B] border border-[#334155] text-[#FFBD2E] text-xs font-bold px-3 py-1.5 rounded-lg">
            Future Simple
          </span>
          <span className="bg-[#1E293B] border border-[#334155] text-[#2DD4BF] text-xs font-bold px-3 py-1.5 rounded-lg">
            Near Future (Be going to)
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Student Name Input Form */}
        <div className="mb-6 text-left">
          <label
            htmlFor="studentNameInput"
            className="block text-[#E2E8F0] font-bold mb-2 text-sm md:text-base flex items-center space-x-2"
          >
            <UserCheck className="w-5 h-5 text-[#38BDF8]" />
            <span>Enter Student / Group Name:</span>
          </label>
          <input
            type="text"
            id="studentNameInput"
            value={studentName}
            onChange={(e) => {
              setStudentName(e.target.value);
              if (e.target.value.trim()) setShowError(false);
            }}
            placeholder="e.g. Alex Smith or Team Alpha"
            className="w-full text-lg px-5 py-3 rounded-xl bg-[#0F1115] border-2 border-[#1E293B] focus:border-[#38BDF8] focus:outline-none transition font-semibold text-[#E2E8F0] placeholder-[#475569] shadow-inner"
            maxLength={25}
          />
          {showError && (
            <p id="nameErrorMsg" className="text-[#F43F5E] text-sm font-bold mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Please enter your name to start!
            </p>
          )}
        </div>

        {/* Game Options (Question count & Timer mode) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div>
            <label className="block text-[#E2E8F0] font-bold mb-2 text-sm flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-[#38BDF8]" /> Question Count:
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#1E293B] font-bold text-[#E2E8F0] bg-[#0F1115] focus:border-[#38BDF8] focus:outline-none cursor-pointer"
            >
              <option value={10}>10 Questions (Quick Quiz)</option>
              <option value={20}>20 Questions (Standard)</option>
              <option value={50}>All 50 Questions (Full Challenge)</option>
            </select>
          </div>
          <div>
            <label className="block text-[#E2E8F0] font-bold mb-2 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#38BDF8]" /> Question Timer:
            </label>
            <select
              value={timerMode}
              onChange={(e) => setTimerMode(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#1E293B] font-bold text-[#E2E8F0] bg-[#0F1115] focus:border-[#38BDF8] focus:outline-none cursor-pointer"
            >
              <option value={45}>45 Seconds per question</option>
              <option value={30}>30 Seconds per question</option>
              <option value={0}>No Timer (Relaxed Mode)</option>
            </select>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          type="submit"
          className="w-full bg-[#38BDF8] hover:bg-[#7DD3FC] active:translate-y-0.5 text-[#0F1115] font-black text-xl md:text-2xl py-4 rounded-xl border-b-4 border-[#0284C7] shadow-lg transition duration-150 flex items-center justify-center space-x-3 group cursor-pointer"
        >
          <span>START GAME</span>
          <Play className="w-6 h-6 fill-[#0F1115] group-hover:translate-x-1.5 transition-transform" />
        </button>
      </form>
    </div>
  );
};

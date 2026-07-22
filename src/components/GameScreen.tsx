import React, { useState, useEffect, useRef } from 'react';
import { User, Star, Flame, Timer as TimerIcon, RotateCcw, Lightbulb, CheckCircle2, ArrowDownWideNarrow, CheckCircle } from 'lucide-react';
import { Question, WordToken } from '../types';
import { playTileClickSound, playCorrectSound, playWrongSound } from '../utils/audio';
import { PRAISE_LIST } from '../data/questions';
import { shuffleArray } from '../utils/leaderboard';

interface GameScreenProps {
  studentName: string;
  questions: Question[];
  initialTimerSetting: number;
  onFinishGame: (score: number, correctCount: number) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  studentName,
  questions,
  initialTimerSetting,
  onFinishGame
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(initialTimerSetting);

  // Active Sentence Construction State
  const [targetTokens, setTargetTokens] = useState<string[]>([]);
  const [poolTokens, setPoolTokens] = useState<WordToken[]>([]);
  const [constructedTokens, setConstructedTokens] = useState<WordToken[]>([]);

  // Feedback State
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isSuccess: boolean;
    mainMsg: string;
    detailMsg: string;
    correctAnswerText: string;
  }>({
    show: false,
    isSuccess: false,
    mainMsg: '',
    detailMsg: '',
    correctAnswerText: ''
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Load question logic
  const loadQuestion = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (index >= questions.length) {
      onFinishGame(score, correctAnswersCount);
      return;
    }

    const q = questions[index];
    const tokens = q.sentence.trim().split(/\s+/);
    setTargetTokens(tokens);

    // Build pool objects with unique IDs
    const tokenObjects: WordToken[] = tokens.map((word, idx) => ({
      id: `token-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      word
    }));

    let shuffled = shuffleArray(tokenObjects);
    if (shuffled.map(t => t.word).join(' ') === tokens.join(' ') && shuffled.length > 1) {
      shuffled.reverse();
    }

    setPoolTokens(shuffled);
    setConstructedTokens([]);
    setFeedback({ show: false, isSuccess: false, mainMsg: '', detailMsg: '', correctAnswerText: '' });
    setIsSubmitDisabled(false);

    // Reset timer if active
    if (initialTimerSetting > 0) {
      setTimerSeconds(initialTimerSetting);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeOut(tokens);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    loadQuestion(0);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTimeOut = (expectedTokens: string[]) => {
    playWrongSound();
    setStreak(0);
    const targetSentence = expectedTokens.join(' ');
    setFeedback({
      show: true,
      isSuccess: false,
      mainMsg: "Time's up!",
      detailMsg: 'Compare your answer with the correct sentence below:',
      correctAnswerText: targetSentence
    });

    setIsSubmitDisabled(true);

    setTimeout(() => {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      loadQuestion(nextIdx);
    }, 3500);
  };

  const handleTileClickInBank = (tokenObj: WordToken) => {
    playTileClickSound();
    setPoolTokens((prev) => prev.filter((t) => t.id !== tokenObj.id));
    setConstructedTokens((prev) => [...prev, tokenObj]);
  };

  const handleTileClickInAnswer = (tokenObj: WordToken) => {
    playTileClickSound();
    setConstructedTokens((prev) => prev.filter((t) => t.id !== tokenObj.id));
    setPoolTokens((prev) => [...prev, tokenObj]);
  };

  const handleClearAnswer = () => {
    if (constructedTokens.length === 0) return;
    playTileClickSound();
    setPoolTokens((prev) => [...prev, ...constructedTokens]);
    setConstructedTokens([]);
  };

  const handleUseHint = () => {
    if (poolTokens.length === 0) return;
    const nextCorrectIndex = constructedTokens.length;
    if (nextCorrectIndex >= targetTokens.length) return;

    const expectedWord = targetTokens[nextCorrectIndex];
    const foundIndex = poolTokens.findIndex((t) => t.word === expectedWord);

    if (foundIndex !== -1) {
      playTileClickSound();
      const matchedToken = poolTokens[foundIndex];
      setPoolTokens((prev) => prev.filter((_, idx) => idx !== foundIndex));
      setConstructedTokens((prev) => [...prev, matchedToken]);

      // Small penalty for hint
      setScore((prev) => Math.max(0, prev - 10));
    }
  };

  const handleCheckAnswer = () => {
    if (constructedTokens.length === 0 || isSubmitDisabled) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const userSentence = constructedTokens.map((t) => t.word).join(' ');
    const targetSentence = targetTokens.join(' ');

    const isCorrect = userSentence === targetSentence;

    if (isCorrect) {
      playCorrectSound();
      const nextCorrectCount = correctAnswersCount + 1;
      const nextStreak = streak + 1;
      setCorrectAnswersCount(nextCorrectCount);
      setStreak(nextStreak);

      const speedBonus = initialTimerSetting > 0 ? timerSeconds * 2 : 0;
      const streakBonus = nextStreak * 10;
      const addedPoints = 100 + speedBonus + streakBonus;
      const nextScore = score + addedPoints;
      setScore(nextScore);

      const randomPraise = PRAISE_LIST[Math.floor(Math.random() * PRAISE_LIST.length)];
      setFeedback({
        show: true,
        isSuccess: true,
        mainMsg: randomPraise,
        detailMsg: `+${addedPoints} Points!`,
        correctAnswerText: ''
      });

      setIsSubmitDisabled(true);

      setTimeout(() => {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        loadQuestion(nextIdx);
      }, 1600);
    } else {
      playWrongSound();
      setStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      setFeedback({
        show: true,
        isSuccess: false,
        mainMsg: 'Try again!',
        detailMsg: 'Compare your answer with the correct sentence below:',
        correctAnswerText: targetSentence
      });

      setIsSubmitDisabled(true);

      setTimeout(() => {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        loadQuestion(nextIdx);
      }, 3500);
    }
  };

  const progressPercent = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="w-full max-w-4xl bg-[#161B22] rounded-2xl p-5 md:p-8 shadow-2xl border border-[#1E293B] relative my-auto">
      {/* Top Dashboard Bar */}
      <div className="flex flex-wrap justify-between items-center bg-[#0F1115] p-3.5 md:p-4 rounded-xl border border-[#1E293B] mb-6 gap-3">
        {/* Player Name & Badge */}
        <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-[#334155]">
          <div className="bg-[#38BDF8]/20 text-[#38BDF8] p-1.5 rounded-lg font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Player</div>
            <div className="font-extrabold text-[#E2E8F0] text-sm md:text-base leading-tight">
              {studentName}
            </div>
          </div>
        </div>

        {/* Score Counter */}
        <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-[#334155]">
          <Star className="w-5 h-5 text-[#FFBD2E] fill-[#FFBD2E]" />
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Score</div>
            <div className="font-black text-[#FFBD2E] text-base md:text-lg leading-tight">{score}</div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-[#334155]">
          <Flame className="w-5 h-5 text-[#F97316] fill-[#F97316]" />
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Streak</div>
            <div className="font-black text-[#F97316] text-base md:text-lg leading-tight">{streak}</div>
          </div>
        </div>

        {/* Countdown Timer Display */}
        {initialTimerSetting > 0 && (
          <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-[#334155]">
            <TimerIcon className="w-5 h-5 text-[#F43F5E] animate-pulse" />
            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Time Left</div>
              <div className="font-black text-[#F43F5E] text-base md:text-lg leading-tight">
                {timerSeconds}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar & Question Counter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 font-bold text-[#94A3B8] text-sm md:text-base">
          <span>
            Question{' '}
            <span className="text-[#38BDF8] font-extrabold">{currentQuestionIndex + 1}</span> /{' '}
            <span>{questions.length}</span>
          </span>
          {currentQuestion && (
            <span className="bg-[#1E293B] border border-[#334155] text-[#38BDF8] text-xs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
              {currentQuestion.tense}
            </span>
          )}
        </div>
        <div className="w-full bg-[#0F1115] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#1E293B]">
          <div
            className="bg-gradient-to-r from-[#38BDF8] to-[#22C55E] h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progressPercent, 2)}%` }}
          />
        </div>
      </div>

      {/* Sentence Construction Area (Drop/Target Slot) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
            <ArrowDownWideNarrow className="w-4 h-4 text-[#38BDF8]" /> Tap words below to build your sentence:
          </span>
          <button
            onClick={handleClearAnswer}
            className="text-xs text-[#F43F5E] hover:text-[#FB7185] font-bold flex items-center space-x-1 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> <span>Reset Answer</span>
          </button>
        </div>

        <div
          className={`min-h-[110px] p-4 bg-[#0F1115] border-2 border-dashed border-[#334155] rounded-xl flex flex-wrap gap-2.5 items-center align-content-start transition-colors ${
            isShaking ? 'shake-animation' : ''
          }`}
        >
          {constructedTokens.length === 0 ? (
            <p className="text-[#475569] italic text-sm md:text-base w-full text-center py-4 pointer-events-none select-none">
              Tap word tiles below to build your sentence...
            </p>
          ) : (
            constructedTokens.map((tokenObj) => (
              <button
                key={tokenObj.id}
                onClick={() => handleTileClickInAnswer(tokenObj)}
                className="constructed-tile bg-[#1E293B] hover:bg-[#334155] text-[#22C55E] font-extrabold text-base md:text-xl px-4 py-2.5 rounded-xl border-b-4 border-[#15803D] transition transform animate-pop cursor-pointer"
              >
                {tokenObj.word}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Scrambled Words Pool */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Word Bank:
          </span>
          <button
            onClick={handleUseHint}
            className="text-xs bg-[#1E293B] text-[#FFBD2E] hover:bg-[#334155] font-bold px-3 py-1 rounded-lg border border-[#334155] transition flex items-center space-x-1 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#FFBD2E] fill-[#FFBD2E]" />
            <span>Get Hint (-10 pts)</span>
          </button>
        </div>

        <div className="min-h-[100px] p-4 bg-[#0F1115]/80 border border-[#1E293B] rounded-xl flex flex-wrap gap-3 items-center justify-center">
          {poolTokens.map((tokenObj) => (
            <button
              key={tokenObj.id}
              onClick={() => handleTileClickInBank(tokenObj)}
              className="word-tile bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] font-extrabold text-base md:text-xl px-4 py-2.5 rounded-xl border-b-4 border-[#0284C7] transition transform animate-pop cursor-pointer"
            >
              {tokenObj.word}
            </button>
          ))}
        </div>
      </div>

      {/* Hints & Feedback Banner Popup */}
      {feedback.show && (
        <div
          className={`mb-6 p-4 rounded-xl text-center font-bold text-lg animate-pop ${
            feedback.isSuccess
              ? 'bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E]'
              : 'bg-[#F43F5E]/10 border border-[#F43F5E]/40 text-[#F43F5E]'
          }`}
        >
          <p className="text-2xl font-black">{feedback.mainMsg}</p>
          <p className="text-sm mt-1 font-semibold">{feedback.detailMsg}</p>
          {feedback.correctAnswerText && (
            <div className="mt-3 p-3.5 bg-[#0F1115] rounded-xl border border-[#334155] text-[#E2E8F0] text-left font-bold text-sm md:text-base shadow-md">
              <span className="text-[#F43F5E] uppercase text-xs font-black tracking-wider flex items-center mb-1">
                <CheckCircle className="w-4 h-4 text-[#22C55E] mr-1" /> Correct Sentence:
              </span>
              <span className="text-[#38BDF8] font-extrabold text-base md:text-lg block bg-[#161B22] p-2.5 rounded-lg border border-[#1E293B]">
                {feedback.correctAnswerText}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleCheckAnswer}
          disabled={constructedTokens.length === 0 || isSubmitDisabled}
          className={`flex-1 bg-[#38BDF8] hover:bg-[#7DD3FC] active:translate-y-0.5 text-[#0F1115] font-black text-xl py-4 rounded-xl border-b-4 border-[#0284C7] shadow-lg transition duration-150 flex items-center justify-center space-x-2 cursor-pointer ${
            constructedTokens.length === 0 || isSubmitDisabled
              ? 'opacity-40 cursor-not-allowed'
              : ''
          }`}
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>CHECK ANSWER</span>
        </button>
      </div>
    </div>
  );
};

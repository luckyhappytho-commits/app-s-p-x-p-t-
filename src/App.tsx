import React, { useState } from 'react';
import { GameView, Question } from './types';
import { ALL_QUESTIONS } from './data/questions';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { isSoundEnabled, setSoundEnabled, playTileClickSound, getAudioContext } from './utils/audio';
import { shuffleArray } from './utils/leaderboard';

export default function App() {
  const [view, setView] = useState<GameView>('start');
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Active Game State
  const [studentName, setStudentName] = useState<string>('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [timerSetting, setTimerSetting] = useState<number>(30);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalCorrectCount, setFinalCorrectCount] = useState<number>(0);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) {
      playTileClickSound();
    }
  };

  const handleStartGame = (name: string, questionCount: number, timerMode: number) => {
    getAudioContext(); // Initialize audio context on click
    setStudentName(name);
    setTimerSetting(timerMode);

    const shuffled = shuffleArray(ALL_QUESTIONS);
    setActiveQuestions(shuffled.slice(0, questionCount));

    setView('game');
  };

  const handleFinishGame = (score: number, correctCount: number) => {
    setFinalScore(score);
    setFinalCorrectCount(correctCount);
    setView('results');
  };

  const handleRestartGame = () => {
    setView('start');
  };

  return (
    <div className="bg-pattern text-gray-800 min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Header Bar */}
      <Header
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Main Container */}
      <main className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center relative z-10 my-auto">
        {view === 'start' && <StartScreen onStartGame={handleStartGame} />}

        {view === 'game' && (
          <GameScreen
            studentName={studentName}
            questions={activeQuestions}
            initialTimerSetting={timerSetting}
            onFinishGame={handleFinishGame}
          />
        )}

        {view === 'results' && (
          <ResultsScreen
            studentName={studentName}
            score={finalScore}
            correctCount={finalCorrectCount}
            totalQuestions={activeQuestions.length}
            onRestartGame={handleRestartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}
      </main>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Classroom Footer */}
      <footer className="w-full text-center py-3 text-xs font-semibold text-indigo-200 bg-indigo-950/40">
        Grade 5 English Grammar Learning Game • Designed for Classroom Projectors & Tablets
      </footer>
    </div>
  );
}


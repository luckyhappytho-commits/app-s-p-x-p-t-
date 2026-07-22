export interface Question {
  id: number;
  tense: string;
  sentence: string;
}

export interface WordToken {
  id: string;
  word: string;
}

export interface LeaderboardRecord {
  name: string;
  score: number;
  accuracy: number;
  date: string;
}

export type GameView = 'start' | 'game' | 'results';

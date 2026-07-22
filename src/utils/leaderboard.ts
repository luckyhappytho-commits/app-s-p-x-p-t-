import { LeaderboardRecord } from '../types';

const STORAGE_KEY = 'english_tense_master_records';

export function getLeaderboard(): LeaderboardRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading leaderboard:', e);
    return [];
  }
}

export function saveLeaderboardRecord(record: LeaderboardRecord): void {
  let list = getLeaderboard();
  list.push(record);
  list.sort((a, b) => b.score - a.score);
  list = list.slice(0, 10);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving leaderboard:', e);
  }
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing leaderboard:', e);
  }
}

export async function sendResultsToGoogleSheets(
  name: string,
  finalScore: number,
  onStatusChange: (status: 'sending' | 'success' | 'local') => void
): Promise<void> {
  onStatusChange('sending');

  const scriptUrl = "https://script.google.com/macros/s/AKfycbzT5JdUbEZjgnmTRBZtdV5D_05zhX9phmQ86HF-MH6kO5tOCr6oZxO9mQ97VdNR-nV7/exec";
  const payload = {
    name: name,
    score: finalScore
  };

  try {
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
    onStatusChange('success');
  } catch (err) {
    console.error("Google Sheets sync error:", err);
    onStatusChange('local');
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

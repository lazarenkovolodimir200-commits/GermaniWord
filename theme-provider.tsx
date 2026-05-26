'use client';

import { useEffect, useState } from 'react';
import { type Language, t } from '@/lib/translations';
import { 
  saveLeaderboardEntry, 
  saveBestResult, 
  getBestResult, 
  formatTime,
  generateId,
  type LeaderboardEntry 
} from '@/lib/game-data';
import type { GameResult } from './game-screen';

interface ResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultScreen({ result, onPlayAgain, onHome }: ResultScreenProps) {
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestResult, setBestResult] = useState<LeaderboardEntry | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const accuracy = Math.round(((result.totalWords - result.errors) / result.totalWords) * 100);

  useEffect(() => {
    // Save to leaderboard
    const entry: LeaderboardEntry = {
      id: generateId(),
      nickname: result.nickname,
      classLevel: result.classLevel,
      language: result.language,
      points: result.points,
      errors: result.errors,
      time: result.time,
      date: new Date().toISOString(),
      topic: result.topic,
    };

    saveLeaderboardEntry(entry);

    // Check and save best result
    const newRecord = saveBestResult(entry);
    setIsNewRecord(newRecord);

    if (newRecord) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Get best result for display
    const best = getBestResult(result.nickname, result.classLevel, result.topic);
    setBestResult(best);
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                fontSize: '2rem',
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-md z-10">
        <div className="glass rounded-3xl p-8 shadow-2xl text-center">
          {/* Trophy icon */}
          <div className="text-7xl mb-4 animate-bounce-soft">🏆</div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gradient mb-2">{t(result.language, 'congratulations')}</h1>

          {/* New record badge */}
          {isNewRecord && (
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
              ⭐ {t(result.language, 'newBestResult')}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-2xl p-4">
              <div className="text-3xl font-bold text-primary">{result.points}</div>
              <div className="text-sm text-muted-foreground">{t(result.language, 'points')}</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-3xl font-bold text-destructive">{result.errors}</div>
              <div className="text-sm text-muted-foreground">{t(result.language, 'errors')}</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-3xl font-bold">{formatTime(result.time)}</div>
              <div className="text-sm text-muted-foreground">{t(result.language, 'time')}</div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="text-3xl font-bold text-primary">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">{t(result.language, 'accuracy')}</div>
            </div>
          </div>

          {/* Streak info */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold">{result.streak}</span>
              <span className="text-muted-foreground">{t(result.language, 'streak')}</span>
            </div>
          </div>

          {/* Best result */}
          {bestResult && (
            <div className="glass rounded-2xl p-4 mb-6">
              <div className="text-sm text-muted-foreground mb-2">{t(result.language, 'bestResult')}</div>
              <div className="flex justify-center gap-4 text-sm">
                <span>⭐ {bestResult.points}</span>
                <span>❌ {bestResult.errors}</span>
                <span>⏱️ {formatTime(bestResult.time)}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onPlayAgain}
              className="w-full py-4 rounded-xl text-lg font-bold bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              {t(result.language, 'playAgain')}
            </button>
            <button
              onClick={onHome}
              className="w-full py-3 rounded-xl text-lg glass hover:bg-secondary/50 transition-all duration-300"
            >
              {t(result.language, 'toHome')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

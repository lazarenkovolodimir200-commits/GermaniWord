'use client';

import { useState, useEffect } from 'react';
import { languages, type Language, t } from '@/lib/translations';
import { getLeaderboard, formatTime, type LeaderboardEntry } from '@/lib/game-data';

interface LeaderboardProps {
  language: Language;
  onClose: () => void;
}

export function Leaderboard({ language, onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterClass, setFilterClass] = useState<string>('all');

  useEffect(() => {
    const leaderboard = getLeaderboard();
    setEntries(leaderboard);
  }, []);

  const filteredEntries = filterClass === 'all' 
    ? entries 
    : entries.filter(e => e.classLevel === filterClass);

  const displayEntries = filteredEntries.slice(0, 10);

  const uniqueClasses = [...new Set(entries.map(e => e.classLevel))].sort((a, b) => parseInt(a) - parseInt(b));

  const getLangFlag = (code: Language) => {
    return languages.find(l => l.code === code)?.flag || '🌍';
  };

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl z-10">
        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient flex items-center gap-3">
              🏆 {t(language, 'leaderboard')}
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass hover:bg-secondary/50 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterClass('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterClass === 'all' ? 'bg-primary text-primary-foreground' : 'glass hover:bg-secondary/50'
              }`}
            >
              {t(language, 'allTopics')}
            </button>
            {uniqueClasses.map(cls => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterClass === cls ? 'bg-primary text-primary-foreground' : 'glass hover:bg-secondary/50'
                }`}
              >
                {cls} {t(language, 'class')}
              </button>
            ))}
          </div>

          {/* Table */}
          {displayEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-muted-foreground text-sm border-b border-border">
                    <th className="text-left p-3">#</th>
                    <th className="text-left p-3">{t(language, 'nickname')}</th>
                    <th className="text-center p-3">{t(language, 'class')}</th>
                    <th className="text-center p-3">{t(language, 'language')}</th>
                    <th className="text-center p-3">{t(language, 'points')}</th>
                    <th className="text-center p-3">{t(language, 'errors')}</th>
                    <th className="text-center p-3">{t(language, 'time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${
                        index < 3 ? 'font-semibold' : ''
                      }`}
                    >
                      <td className="p-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full glass">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </span>
                      </td>
                      <td className="p-3">{entry.nickname}</td>
                      <td className="text-center p-3">{entry.classLevel}</td>
                      <td className="text-center p-3">{getLangFlag(entry.language)}</td>
                      <td className="text-center p-3 text-primary font-semibold">{entry.points}</td>
                      <td className="text-center p-3 text-destructive">{entry.errors}</td>
                      <td className="text-center p-3">{formatTime(entry.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t(language, 'noWords')}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-xl glass hover:bg-secondary/50 transition-all"
          >
            {t(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
}

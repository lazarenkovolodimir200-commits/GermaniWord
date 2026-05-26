'use client';

import { useState } from 'react';
import type { Language } from '@/lib/translations';
import { StartScreen } from '@/components/start-screen';
import { GameScreen, type GameResult } from '@/components/game-screen';
import { ResultScreen } from '@/components/result-screen';
import { Leaderboard } from '@/components/leaderboard';
import { AdminPanel } from '@/components/admin-panel';

type Screen = 'start' | 'game' | 'result' | 'leaderboard' | 'admin';

interface GameSettings {
  nickname: string;
  language: Language;
  classLevel: string;
  topic: string;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('start');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ru');

  const handleStartGame = (nickname: string, language: Language, classLevel: string, topic: string) => {
    setGameSettings({ nickname, language, classLevel, topic });
    setCurrentLanguage(language);
    setScreen('game');
  };

  const handleFinishGame = (result: GameResult) => {
    setGameResult(result);
    setScreen('result');
  };

  const handlePlayAgain = () => {
    if (gameSettings) {
      setScreen('game');
    }
  };

  const handleGoHome = () => {
    setScreen('start');
    setGameSettings(null);
    setGameResult(null);
  };

  const handleOpenLeaderboard = () => {
    setScreen('leaderboard');
  };

  const handleOpenAdmin = () => {
    setScreen('admin');
  };

  return (
    <main className="min-h-screen">
      {screen === 'start' && (
        <StartScreen
          onStart={handleStartGame}
          onOpenAdmin={handleOpenAdmin}
          onOpenLeaderboard={handleOpenLeaderboard}
        />
      )}

      {screen === 'game' && gameSettings && (
        <GameScreen
          nickname={gameSettings.nickname}
          language={gameSettings.language}
          classLevel={gameSettings.classLevel}
          topic={gameSettings.topic}
          onFinish={handleFinishGame}
          onQuit={handleGoHome}
        />
      )}

      {screen === 'result' && gameResult && (
        <ResultScreen
          result={gameResult}
          onPlayAgain={handlePlayAgain}
          onHome={handleGoHome}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard
          language={currentLanguage}
          onClose={handleGoHome}
        />
      )}

      {screen === 'admin' && (
        <AdminPanel
          language={currentLanguage}
          onClose={handleGoHome}
        />
      )}
    </main>
  );
}

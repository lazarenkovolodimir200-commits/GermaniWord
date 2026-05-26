'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Language, t } from '@/lib/translations';
import {
  getWords,
  getTopics,
  shuffleArray,
  generateOptions,
  speakGerman,
  formatTime,
  type Word,
  type Topic,
} from '@/lib/game-data';

interface GameScreenProps {
  nickname: string;
  language: Language;
  classLevel: string;
  topic: string;
  onFinish: (result: GameResult) => void;
  onQuit: () => void;
}

export interface GameResult {
  nickname: string;
  language: Language;
  classLevel: string;
  topic: string;
  points: number;
  errors: number;
  totalWords: number;
  time: number;
  streak: number;
}

export function GameScreen({ nickname, language, classLevel, topic, onFinish, onQuit }: GameScreenProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [allWords, setAllWords] = useState<Word[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadedWords = getWords();
    const loadedTopics = getTopics();
    setAllWords(loadedWords);
    setTopics(loadedTopics);

    // Filter words by class and topic
    let filteredWords = loadedWords.filter(w => w.classLevel === classLevel);
    if (topic !== 'all') {
      filteredWords = filteredWords.filter(w => w.topic === topic);
    }

    const shuffledWords = shuffleArray(filteredWords);
    setWords(shuffledWords);

    if (shuffledWords.length > 0) {
      setOptions(generateOptions(shuffledWords[0], loadedWords, language));
    }

    // Start timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [classLevel, topic, language]);

  const currentWord = words[currentIndex];
  const topicData = currentWord ? topics.find(tp => tp.id === currentWord.topic) : null;

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer !== null || !currentWord) return;

    const correct = answer === currentWord.translations[language];
    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setPoints(prev => prev + 10 + streak * 2);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setErrors(prev => prev + 1);
      setStreak(0);
    }

    // Speak the word
    speakGerman(currentWord.german);

    // Move to next word after delay
    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        // Game finished
        if (timerRef.current) clearInterval(timerRef.current);
        const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onFinish({
          nickname,
          language,
          classLevel,
          topic,
          points: points + (correct ? 10 + streak * 2 : 0),
          errors: errors + (correct ? 0 : 1),
          totalWords: words.length,
          time: finalTime,
          streak: Math.max(maxStreak, correct ? streak + 1 : streak),
        });
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setOptions(generateOptions(words[currentIndex + 1], allWords, language));
      }
    }, 1500);
  }, [selectedAnswer, currentWord, language, streak, currentIndex, words, allWords, onFinish, nickname, classLevel, topic, points, errors, maxStreak]);

  const handleSpeak = () => {
    if (currentWord) {
      speakGerman(currentWord.german);
    }
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-xl">{t(language, 'noWords')}</p>
          <button
            onClick={onQuit}
            className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl"
          >
            {t(language, 'toHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-game flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 p-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-4">
              <span>👤 {nickname}</span>
              <span>🏫 {classLevel}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary">⭐ {points}</span>
              <span className="text-destructive">❌ {errors}</span>
              <span className="text-warning">🔥 {streak}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>📚 {words.length - currentIndex - 1}</span>
              <span>⏱️ {formatTime(elapsedTime)}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Word card */}
          <div
            className={`glass rounded-3xl p-8 mb-6 text-center transition-all duration-300 ${
              isCorrect === true ? 'ring-4 ring-primary animate-correct' : ''
            } ${isCorrect === false ? 'ring-4 ring-destructive animate-shake' : ''}`}
          >
            {/* Topic badge */}
            {topicData && (
              <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-1 rounded-full text-sm mb-4">
                <span>{topicData.icon}</span>
                <span>{topicData.names[language]}</span>
              </div>
            )}

            {/* German word */}
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient">{currentWord.german}</h2>
              <button
                onClick={handleSpeak}
                className="p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-all hover:scale-110"
              >
                🔊
              </button>
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
              <div className={`mt-4 text-lg font-semibold ${isCorrect ? 'text-primary' : 'text-destructive'}`}>
                {isCorrect ? t(language, 'correct') : `${t(language, 'incorrect')} ${currentWord.translations[language]}`}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentWord.translations[language];
              const showCorrect = selectedAnswer !== null && isCorrectOption;
              const showWrong = isSelected && !isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`glass p-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
                    showCorrect
                      ? 'bg-primary text-primary-foreground scale-105'
                      : showWrong
                        ? 'bg-destructive text-destructive-foreground'
                        : selectedAnswer !== null
                          ? 'opacity-50'
                          : 'hover:bg-secondary/50 hover:scale-102'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Quit button */}
          <button
            onClick={onQuit}
            className="mt-6 w-full glass py-3 rounded-xl text-muted-foreground hover:text-foreground transition-all"
          >
            {t(language, 'toHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

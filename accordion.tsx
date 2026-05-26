'use client';

import { useState, useEffect, useCallback } from 'react';
import { languages, type Language, t } from '@/lib/translations';
import { 
  getWords, 
  getTopics,
  getClasses,
  getSavedNickname,
  saveNickname,
  getSavedLanguage,
  saveLanguage,
  shuffleArray, 
  type Word, 
  type Topic 
} from '@/lib/game-data';

interface StartScreenProps {
  onStart: (nickname: string, language: Language, classLevel: string, topic: string) => void;
  onOpenAdmin: () => void;
  onOpenLeaderboard: () => void;
}

export function StartScreen({ onStart, onOpenAdmin, onOpenLeaderboard }: StartScreenProps) {
  const [nickname, setNickname] = useState('');
  const [language, setLanguage] = useState<Language>('ru');
  const [classLevel, setClassLevel] = useState('5');
  const [topic, setTopic] = useState('all');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  useEffect(() => {
    // Load saved nickname and language
    const savedNickname = getSavedNickname();
    const savedLang = getSavedLanguage() as Language;
    if (savedNickname) setNickname(savedNickname);
    if (savedLang) setLanguage(savedLang);
    
    const loadedTopics = getTopics();
    const loadedWords = getWords();
    const loadedClasses = getClasses();
    setTopics(loadedTopics);
    setWords(loadedWords);
    setAvailableClasses(loadedClasses);
  }, []);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    saveNickname(value);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  const getFilteredWordCount = useCallback(() => {
    let filtered = words.filter(w => w.classLevel === classLevel);
    if (topic !== 'all') {
      filtered = filtered.filter(w => w.topic === topic);
    }
    return filtered.length;
  }, [words, classLevel, topic]);

  const canPlay = nickname.trim().length > 0 && getFilteredWordCount() > 0;

  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Admin & Leaderboard buttons */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={onOpenLeaderboard}
              className="glass px-4 py-2 rounded-xl text-sm hover:bg-secondary/50 transition-all duration-300 flex items-center gap-2"
            >
              <span>🏆</span>
              <span className="hidden sm:inline">{t(language, 'leaderboard')}</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="glass px-4 py-2 rounded-xl text-sm hover:bg-secondary/50 transition-all duration-300 flex items-center gap-2"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🇩🇪</div>
            <h1 className="text-3xl font-bold text-gradient mb-2">German Word Battle</h1>
            <p className="text-muted-foreground text-sm">{t(language, 'selectLanguage')}</p>
          </div>

          {/* Nickname input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={t(language, 'enterNickname')}
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              maxLength={20}
            />
          </div>

          {/* Language selection */}
          <div className="mb-6">
            <label className="block text-sm text-muted-foreground mb-2">{t(language, 'selectLanguage')}</label>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                    language === lang.code
                      ? 'bg-primary text-primary-foreground scale-105'
                      : 'glass hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-2xl mb-1">{lang.flag}</span>
                  <span className="text-xs truncate w-full text-center">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Class selection */}
          <div className="mb-6">
            <label className="block text-sm text-muted-foreground mb-2">{t(language, 'selectClass')}</label>
            <div className="flex flex-wrap gap-2">
              {(availableClasses.length > 0 ? availableClasses : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setClassLevel(cls)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    classLevel === cls
                      ? 'bg-primary text-primary-foreground'
                      : 'glass hover:bg-secondary/50'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Topic selection */}
          <div className="mb-8">
            <label className="block text-sm text-muted-foreground mb-2">{t(language, 'selectTopic')}</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTopic('all')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  topic === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'glass hover:bg-secondary/50'
                }`}
              >
                📚 {t(language, 'allTopics')}
              </button>
              {topics.map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setTopic(tp.id)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                    topic === tp.id
                      ? 'bg-primary text-primary-foreground'
                      : 'glass hover:bg-secondary/50'
                  }`}
                >
                  {tp.icon} {tp.names[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Word count info */}
          <div className="text-center mb-4 text-sm text-muted-foreground">
            {t(language, 'words')}: {getFilteredWordCount()}
          </div>

          {/* Play button */}
          <button
            onClick={() => canPlay && onStart(nickname.trim(), language, classLevel, topic)}
            disabled={!canPlay}
            className={`w-full py-4 rounded-xl text-xl font-bold transition-all duration-300 ${
              canPlay
                ? 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-primary/25'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {t(language, 'play')}
          </button>

          {!canPlay && nickname.trim().length > 0 && getFilteredWordCount() === 0 && (
            <p className="text-center text-destructive text-sm mt-2">{t(language, 'noWords')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

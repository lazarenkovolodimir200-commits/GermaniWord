'use client';

import { useState, useEffect, useRef } from 'react';
import { languages, type Language, t } from '@/lib/translations';
import {
  getWords,
  saveWords,
  getTopics,
  saveTopics,
  getClasses,
  saveClasses,
  getLeaderboard,
  getAllPlayers,
  deletePlayerFromLeaderboard,
  clearLeaderboard,
  generateId,
  formatTime,
  type Word,
  type Topic,
  type LeaderboardEntry,
} from '@/lib/game-data';

interface AdminPanelProps {
  language: Language;
  onClose: () => void;
}

const ADMIN_PASSWORD = 'Gw8$kL2#mNp9@xQz4!vRt7&yUj5';

export function AdminPanel({ language, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'words' | 'topics' | 'classes' | 'players'>('words');
  const [words, setWords] = useState<Word[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [players, setPlayers] = useState<{ nickname: string; gamesPlayed: number; lastPlayed: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setWords(getWords());
      setTopics(getTopics());
      setClasses(getClasses());
      setPlayers(getAllPlayers());
      setLeaderboard(getLeaderboard());
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const filteredWords = words.filter(word => {
    const matchesSearch = word.german.toLowerCase().includes(search.toLowerCase()) ||
      Object.values(word.translations).some(tr => tr.toLowerCase().includes(search.toLowerCase()));
    const matchesClass = filterClass === 'all' || word.classLevel === filterClass;
    const matchesTopic = filterTopic === 'all' || word.topic === filterTopic;
    return matchesSearch && matchesClass && matchesTopic;
  });

  const uniqueClasses = [...new Set(words.map(w => w.classLevel))].sort((a, b) => parseInt(a) - parseInt(b));

  // Word CRUD operations
  const saveWord = (word: Word) => {
    let updatedWords: Word[];
    if (words.find(w => w.id === word.id)) {
      updatedWords = words.map(w => w.id === word.id ? word : w);
    } else {
      updatedWords = [...words, word];
    }
    setWords(updatedWords);
    saveWords(updatedWords);
    setEditingWord(null);
    setIsAddingWord(false);
  };

  const deleteWord = (id: string) => {
    const updatedWords = words.filter(w => w.id !== id);
    setWords(updatedWords);
    saveWords(updatedWords);
  };

  // Topic CRUD operations
  const saveTopic = (topic: Topic) => {
    let updatedTopics: Topic[];
    if (topics.find(tp => tp.id === topic.id)) {
      updatedTopics = topics.map(tp => tp.id === topic.id ? topic : tp);
    } else {
      updatedTopics = [...topics, topic];
    }
    setTopics(updatedTopics);
    saveTopics(updatedTopics);
    setEditingTopic(null);
    setIsAddingTopic(false);
  };

  const deleteTopic = (id: string) => {
    const updatedTopics = topics.filter(tp => tp.id !== id);
    setTopics(updatedTopics);
    saveTopics(updatedTopics);
  };

  // Class operations
  const addClass = (newClass: string) => {
    if (!classes.includes(newClass)) {
      const updated = [...classes, newClass].sort((a, b) => parseInt(a) - parseInt(b));
      setClasses(updated);
      saveClasses(updated);
    }
  };

  const deleteClass = (cls: string) => {
    const updated = classes.filter(c => c !== cls);
    setClasses(updated);
    saveClasses(updated);
  };

  // Player operations
  const handleDeletePlayer = (nickname: string) => {
    deletePlayerFromLeaderboard(nickname);
    setPlayers(getAllPlayers());
    setLeaderboard(getLeaderboard());
  };

  const handleClearLeaderboard = () => {
    if (confirm(t(language, 'confirmClearLeaderboard') || 'Clear all leaderboard data?')) {
      clearLeaderboard();
      setPlayers([]);
      setLeaderboard([]);
    }
  };

  // Import/Export
  const handleExport = () => {
    const data = { words, topics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'german-word-battle-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.words && Array.isArray(data.words)) {
          setWords(data.words);
          saveWords(data.words);
        }
        if (data.topics && Array.isArray(data.topics)) {
          setTopics(data.topics);
          saveTopics(data.topics);
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm z-10">
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-gradient mb-6 text-center">
              ⚙️ {t(language, 'admin')}
            </h1>

            <div className="space-y-4">
              <input
                type="password"
                placeholder={t(language, 'password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {passwordError && (
                <p className="text-destructive text-sm text-center">{t(language, 'wrongPassword')}</p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all"
              >
                {t(language, 'enter')}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl glass hover:bg-secondary/50 transition-all"
              >
                {t(language, 'cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-game p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gradient flex items-center gap-2">
            ⚙️ {t(language, 'admin')}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl glass hover:bg-secondary/50 transition-all text-sm"
            >
              📥 {t(language, 'importJson')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl glass hover:bg-secondary/50 transition-all text-sm"
            >
              📤 {t(language, 'exportJson')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass hover:bg-secondary/50 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('words')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'words' ? 'bg-primary text-primary-foreground' : 'glass hover:bg-secondary/50'
            }`}
          >
            {t(language, 'words')} ({words.length})
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'topics' ? 'bg-primary text-primary-foreground' : 'glass hover:bg-secondary/50'
            }`}
          >
            {t(language, 'topics')} ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'classes' ? 'bg-primary text-primary-foreground' : 'glass hover:bg-secondary/50'
            }`}
          >
            {t(language, 'classes')} ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'players' ? 'bg-primary text-primary-foreground' : 'glass hover:bg-secondary/50'
            }`}
          >
            {t(language, 'players')} ({players.length})
          </button>
        </div>

        {/* Words Tab */}
        {activeTab === 'words' && (
          <div className="glass rounded-2xl p-4 md:p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder={t(language, 'search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none"
              >
                <option value="all">{t(language, 'allTopics')}</option>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map(cls => (
                  <option key={cls} value={cls}>{cls} {t(language, 'class')}</option>
                ))}
              </select>

              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none"
              >
                <option value="all">{t(language, 'allTopics')}</option>
                {topics.map(tp => (
                  <option key={tp.id} value={tp.id}>{tp.icon} {tp.names[language]}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setIsAddingWord(true);
                  setEditingWord({
                    id: generateId(),
                    german: '',
                    topic: topics[0]?.id || '',
                    classLevel: '5',
                    translations: { ru: '', uk: '', en: '', fr: '', sq: '', hi: '', ar: '', az: '' }
                  });
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all"
              >
                + {t(language, 'addWord')}
              </button>
            </div>

            {/* Words list */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredWords.map(word => (
                <div
                  key={word.id}
                  className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold text-lg">{word.german}</div>
                    <div className="text-sm text-muted-foreground">
                      {word.translations[language]} • {t(language, 'class')} {word.classLevel} • {topics.find(tp => tp.id === word.topic)?.icon}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingWord(word)}
                      className="px-3 py-1 rounded-lg glass hover:bg-secondary/50 transition-all text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="px-3 py-1 rounded-lg glass hover:bg-destructive/20 text-destructive transition-all text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {filteredWords.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {t(language, 'noWords')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="glass rounded-2xl p-4 md:p-6">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setIsAddingTopic(true);
                  setEditingTopic({
                    id: generateId(),
                    icon: '📌',
                    names: { ru: '', uk: '', en: '', fr: '', sq: '', hi: '', ar: '', az: '' }
                  });
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all"
              >
                + {t(language, 'addTopic')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className="glass rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{topic.icon}</span>
                    <div>
                      <div className="font-semibold">{topic.names[language]}</div>
                      <div className="text-sm text-muted-foreground">ID: {topic.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTopic(topic)}
                      className="px-3 py-1 rounded-lg glass hover:bg-secondary/50 transition-all text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="px-3 py-1 rounded-lg glass hover:bg-destructive/20 text-destructive transition-all text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <ClassesTab
            classes={classes}
            language={language}
            onAddClass={addClass}
            onDeleteClass={deleteClass}
          />
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <PlayersTab
            players={players}
            leaderboard={leaderboard}
            language={language}
            onDeletePlayer={handleDeletePlayer}
            onClearLeaderboard={handleClearLeaderboard}
          />
        )}

        {/* Word Edit Modal */}
        {(editingWord || isAddingWord) && editingWord && (
          <WordEditModal
            word={editingWord}
            topics={topics}
            language={language}
            onSave={saveWord}
            onCancel={() => {
              setEditingWord(null);
              setIsAddingWord(false);
            }}
          />
        )}

        {/* Topic Edit Modal */}
        {(editingTopic || isAddingTopic) && editingTopic && (
          <TopicEditModal
            topic={editingTopic}
            language={language}
            onSave={saveTopic}
            onCancel={() => {
              setEditingTopic(null);
              setIsAddingTopic(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Word Edit Modal Component
function WordEditModal({
  word,
  topics,
  language,
  onSave,
  onCancel,
}: {
  word: Word;
  topics: Topic[];
  language: Language;
  onSave: (word: Word) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(word);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">{t(language, 'editWord')}</h2>

        <div className="space-y-4">
          {/* German word */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">{t(language, 'german')}</label>
            <input
              type="text"
              value={formData.german}
              onChange={(e) => setFormData({ ...formData, german: e.target.value })}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Class and Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t(language, 'class')}</label>
              <select
                value={formData.classLevel}
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t(language, 'topic')}</label>
              <select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none"
              >
                {topics.map(tp => (
                  <option key={tp.id} value={tp.id}>{tp.icon} {tp.names[language]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Translations */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">{t(language, 'translations')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {languages.map(lang => (
                <div key={lang.code} className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <input
                    type="text"
                    value={formData.translations[lang.code]}
                    onChange={(e) => setFormData({
                      ...formData,
                      translations: { ...formData.translations, [lang.code]: e.target.value }
                    })}
                    placeholder={lang.name}
                    className="flex-1 bg-input/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.german.trim()}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(language, 'save')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl glass hover:bg-secondary/50 transition-all"
          >
            {t(language, 'cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Topic Edit Modal Component
function TopicEditModal({
  topic,
  language,
  onSave,
  onCancel,
}: {
  topic: Topic;
  language: Language;
  onSave: (topic: Topic) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(topic);

  const commonIcons = ['⚽', '🕒', '🚆', '🏠', '📞', '🛒', '🎓', '🍎', '🌍', '💼', '🎵', '🎨', '🏥', '👔', '🌳'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">{t(language, 'addTopic')}</h2>

        <div className="space-y-4">
          {/* Icon */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">{t(language, 'topicIcon')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonIcons.map(icon => (
                <button
                  key={icon}
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    formData.icon === icon ? 'bg-primary' : 'glass hover:bg-secondary/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Or enter emoji..."
              className="w-32 bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Names in all languages */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">{t(language, 'topicName')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {languages.map(lang => (
                <div key={lang.code} className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <input
                    type="text"
                    value={formData.names[lang.code]}
                    onChange={(e) => setFormData({
                      ...formData,
                      names: { ...formData.names, [lang.code]: e.target.value }
                    })}
                    placeholder={lang.name}
                    className="flex-1 bg-input/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.names.en.trim()}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(language, 'save')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl glass hover:bg-secondary/50 transition-all"
          >
            {t(language, 'cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Classes Tab Component
function ClassesTab({
  classes,
  language,
  onAddClass,
  onDeleteClass,
}: {
  classes: string[];
  language: Language;
  onAddClass: (cls: string) => void;
  onDeleteClass: (cls: string) => void;
}) {
  const [newClass, setNewClass] = useState('');

  const handleAdd = () => {
    if (newClass.trim() && !classes.includes(newClass.trim())) {
      onAddClass(newClass.trim());
      setNewClass('');
    }
  };

  return (
    <div className="glass rounded-2xl p-4 md:p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={t(language, 'newClass')}
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 min-w-[150px] bg-input/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={handleAdd}
          disabled={!newClass.trim() || classes.includes(newClass.trim())}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all disabled:opacity-50"
        >
          + {t(language, 'addClass')}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {classes.map(cls => (
          <div
            key={cls}
            className="glass rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-xl font-bold">{cls}</span>
            <button
              onClick={() => onDeleteClass(cls)}
              className="p-1 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t(language, 'noClasses')}
        </div>
      )}
    </div>
  );
}

// Players Tab Component
function PlayersTab({
  players,
  leaderboard,
  language,
  onDeletePlayer,
  onClearLeaderboard,
}: {
  players: { nickname: string; gamesPlayed: number; lastPlayed: string }[];
  leaderboard: LeaderboardEntry[];
  language: Language;
  onDeletePlayer: (nickname: string) => void;
  onClearLeaderboard: () => void;
}) {
  const getLangFlag = (code: Language) => {
    return languages.find(l => l.code === code)?.flag || '';
  };

  return (
    <div className="glass rounded-2xl p-4 md:p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold">
          {t(language, 'totalPlayers')}: {players.length}
        </h2>
        <button
          onClick={onClearLeaderboard}
          className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:scale-105 transition-all"
        >
          {t(language, 'clearLeaderboard')}
        </button>
      </div>

      {/* Players list */}
      <div className="mb-8">
        <h3 className="text-md font-semibold mb-4">{t(language, 'players')}</h3>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {players.map(player => (
            <div
              key={player.nickname}
              className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="font-semibold">{player.nickname}</div>
                <div className="text-sm text-muted-foreground">
                  {t(language, 'gamesPlayed')}: {player.gamesPlayed} | {t(language, 'lastPlayed')}: {new Date(player.lastPlayed).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`${t(language, 'deletePlayer')} "${player.nickname}"?`)) {
                    onDeletePlayer(player.nickname);
                  }
                }}
                className="px-3 py-1 rounded-lg glass hover:bg-destructive/20 text-destructive transition-all text-sm"
              >
                {t(language, 'delete')}
              </button>
            </div>
          ))}
          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t(language, 'noPlayers')}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard preview */}
      <div>
        <h3 className="text-md font-semibold mb-4">{t(language, 'leaderboard')} (Top 10)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">{t(language, 'nickname')}</th>
                <th className="text-center p-2">{t(language, 'class')}</th>
                <th className="text-center p-2">{t(language, 'language')}</th>
                <th className="text-center p-2">{t(language, 'points')}</th>
                <th className="text-center p-2">{t(language, 'errors')}</th>
                <th className="text-center p-2">{t(language, 'time')}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 10).map((entry, index) => (
                <tr key={entry.id} className="border-b border-border/50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{entry.nickname}</td>
                  <td className="text-center p-2">{entry.classLevel}</td>
                  <td className="text-center p-2">{getLangFlag(entry.language)}</td>
                  <td className="text-center p-2 text-primary">{entry.points}</td>
                  <td className="text-center p-2 text-destructive">{entry.errors}</td>
                  <td className="text-center p-2">{formatTime(entry.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t(language, 'noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

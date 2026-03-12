import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, Folder, UserPreferences } from './types';
import { THEME_COLORS, calculateStreak } from './utils';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { SplashScreen } from './components/SplashScreen';
import { CommandPalette } from './components/CommandPalette';
import { Feather } from 'lucide-react';
import { t } from './i18n';

type ViewState = 'main' | 'settings';

export default function App() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const [view, setView] = useState<ViewState>('main');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('notes_onboarded');
    setShowOnboarding(onboarded !== 'true');

    const savedPrefs = localStorage.getItem('notes_prefs');
    if (savedPrefs) {
      try { 
        const parsed = JSON.parse(savedPrefs);
        setPrefs({
          ...parsed,
          language: parsed.language || 'en',
          fontSize: parsed.fontSize || 'medium',
          enableAI: parsed.enableAI ?? true,
          showSplash: parsed.showSplash ?? true
        }); 
      } catch (e) {}
    } else {
      setPrefs({ name: '', themeColor: THEME_COLORS[0].value, darkMode: false, language: 'en', fontSize: 'medium', enableAI: true, showSplash: true });
    }
    
    const savedNotes = localStorage.getItem('notes_data');
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch (e) {}
    }

    const savedFolders = localStorage.getItem('notes_folders');
    if (savedFolders) {
      try { setFolders(JSON.parse(savedFolders)); } catch (e) {}
    }
  }, []);

  const saveNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('notes_data', JSON.stringify(newNotes));
  }, []);

  const saveFolders = useCallback((newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('notes_folders', JSON.stringify(newFolders));
  }, []);

  const savePrefs = useCallback((newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    localStorage.setItem('notes_prefs', JSON.stringify(newPrefs));
    localStorage.setItem('notes_onboarded', 'true');
  }, []);

  const handleCompleteOnboarding = useCallback((newPrefs: UserPreferences) => {
    savePrefs(newPrefs);
    setShowOnboarding(false);
  }, [savePrefs]);

  const handleReplayOnboarding = useCallback(() => {
    setShowOnboarding(true);
    setView('main');
  }, []);

  const handleCreateFolder = useCallback((name: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substring(2, 9),
      name
    };
    setFolders(prev => {
      const updated = [...prev, newFolder];
      localStorage.setItem('notes_folders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: '',
      content: '',
      folderId: activeFolderId,
      updatedAt: Date.now(),
      tags: activeTag ? [activeTag] : []
    };
    setNotes(prev => {
      const updated = [newNote, ...prev];
      localStorage.setItem('notes_data', JSON.stringify(updated));
      return updated;
    });
    setActiveNoteId(newNote.id);
    setView('main');
  }, [activeFolderId, activeTag]);

  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === updatedNote.id ? updatedNote : n);
      updated.sort((a, b) => b.updatedAt - a.updatedAt);
      localStorage.setItem('notes_data', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('notes_data', JSON.stringify(updated));
      return updated;
    });
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const handleDeleteFolder = useCallback((id: string) => {
    setFolders(prev => {
      const updated = prev.filter(f => f.id !== id);
      localStorage.setItem('notes_folders', JSON.stringify(updated));
      return updated;
    });
    setNotes(prev => {
      const updated = prev.filter(n => n.folderId !== id);
      localStorage.setItem('notes_data', JSON.stringify(updated));
      return updated;
    });
    if (activeFolderId === id) {
      setActiveFolderId(null);
    }
  }, [activeFolderId]);

  const handleExport = () => {
    const data = { notes, folders, prefs };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minimal-notes-backup.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.notes) saveNotes(data.notes);
        if (data.folders) saveFolders(data.folders);
        if (data.prefs) savePrefs(data.prefs);
        alert('Backup imported successfully!');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  const streak = useMemo(() => calculateStreak(notes), [notes]);
  const allTags = useMemo(() => Array.from(new Set(notes.flatMap(n => n.tags || []))), [notes]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N for New Note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
      // Cmd/Ctrl + , for Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setView(prev => prev === 'settings' ? 'main' : 'settings');
      }
      // Cmd/Ctrl + F for Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Cmd/Ctrl + K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote]);

  // Wait for initial load
  if (showOnboarding === null || !prefs) return null;

  const activeNote = notes.find(n => n.id === activeNoteId);
  const shouldShowSplash = showSplash && prefs.showSplash;

  return (
    <div className={prefs.darkMode ? 'dark' : ''}>
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        folders={folders}
        prefs={prefs}
        onSelectNote={(id) => { setActiveNoteId(id); setView('main'); }}
        onCreateNote={handleCreateNote}
        onOpenSettings={() => setView('settings')}
        onToggleTheme={() => savePrefs({ ...prefs, darkMode: !prefs.darkMode })}
      />
      <div className="h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans transition-colors duration-500 overflow-hidden flex">
        {shouldShowSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} themeColor={prefs.themeColor} />
        ) : showOnboarding ? (
          <Onboarding onComplete={handleCompleteOnboarding} />
        ) : (
          <>
            {/* Desktop 3-Pane Layout */}
            <Sidebar 
              folders={folders}
              activeFolderId={activeFolderId}
              activeTag={activeTag}
              onSelectFolder={(id) => { setActiveFolderId(id); setView('main'); }}
              onSelectTag={(tag) => { setActiveTag(tag); setView('main'); }}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onOpenSettings={() => setView('settings')}
              prefs={prefs}
              streak={streak}
              allTags={allTags}
              notes={notes}
            />

            <NoteList 
              notes={notes}
              folders={folders}
              activeFolderId={activeFolderId}
              activeTag={activeTag}
              activeNoteId={activeNoteId}
              onSelectNote={(id) => { setActiveNoteId(id); setView('main'); }}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              prefs={prefs}
            />

            <div className="flex-1 flex flex-col relative bg-[var(--bg-primary)]">
              <AnimatePresence mode="wait">
                {view === 'settings' ? (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 z-50 bg-[var(--bg-primary)]"
                  >
                    <Settings 
                      prefs={prefs} 
                      onUpdatePrefs={savePrefs}
                      onBack={() => setView('main')}
                      onReplayOnboarding={handleReplayOnboarding}
                      onExport={handleExport}
                      onImport={handleImport}
                      onDeleteAll={handleDeleteAll}
                    />
                  </motion.div>
                ) : activeNote ? (
                  <motion.div
                    key={`editor-${activeNote.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-[var(--bg-primary)]"
                  >
                    <Editor 
                      note={activeNote} 
                      onSave={handleUpdateNote}
                      onBack={() => setActiveNoteId(null)}
                      onDelete={handleDeleteNote}
                      prefs={prefs}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-faint)]"
                  >
                    <Feather className="w-16 h-16 mb-4 opacity-50" strokeWidth={1.5} />
                    <p className="text-xl font-bold text-[var(--text-main)] font-serif">{t('app.title', prefs.language)}</p>
                    <p className="text-[15px] mt-2">{t('main.search.empty', prefs.language, { search: 'Select a note to start writing' }).replace('"', '').replace('"', '')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

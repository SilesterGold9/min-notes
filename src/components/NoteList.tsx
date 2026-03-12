import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, X, Folder as FolderIcon, Trash2 } from 'lucide-react';
import { Note, Folder, UserPreferences } from '../types';
import { formatDate, stripHtml } from '../utils';
import { Tooltip } from './Tooltip';
import { t } from '../i18n';

export const NoteList = ({
  notes,
  folders,
  activeFolderId,
  activeTag,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  prefs
}: {
  notes: Note[];
  folders: Folder[];
  activeFolderId: string | null;
  activeTag: string | null;
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  prefs: UserPreferences;
}) => {
  const [search, setSearch] = useState('');
  const lang = prefs.language;

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (activeFolderId) {
      filtered = filtered.filter(n => n.folderId === activeFolderId);
    }
    if (activeTag) {
      filtered = filtered.filter(n => n.tags && n.tags.includes(activeTag));
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(s) || 
        n.content.toLowerCase().includes(s) ||
        (n.tags && n.tags.some(tag => tag.toLowerCase().includes(s)))
      );
    }
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, activeFolderId, activeTag, search]);

  const folderName = activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : null;

  return (
    <div className="w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] flex flex-col h-full">
      <div className="p-5 flex flex-col gap-4 sticky top-0 bg-[var(--bg-primary)]/90 backdrop-blur-md z-10 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[18px] text-[var(--text-main)] truncate">
            {activeTag ? activeTag : folderName ? folderName : t('main.all_notes', lang)}
          </h2>
          <Tooltip content="New Note (Cmd/Ctrl + N)" position="bottom">
            <button 
              onClick={onCreateNote}
              className="p-2 rounded-xl text-white shadow-sm transition-transform active:scale-95 flex items-center justify-center"
              style={{ backgroundColor: prefs.themeColor }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </Tooltip>
        </div>
        
        <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm rounded-xl px-3 py-2 transition-shadow focus-within:shadow-md focus-within:border-transparent focus-within:ring-2" style={{ '--tw-ring-color': prefs.themeColor } as React.CSSProperties}>
          <Search className="w-4 h-4 text-[var(--text-faint)] mr-2" />
          <input 
            id="global-search-input"
            type="text" 
            placeholder={`${t('main.search', lang)} (Cmd/Ctrl+F)`}
            className="bg-transparent border-none outline-none flex-1 text-[14px] text-[var(--text-main)] placeholder:text-[var(--text-faint)]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-faint)]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-[var(--text-faint)] py-10 font-medium px-4">
            {search ? t('main.search.empty', lang, { search }) : t('folder.empty.desc', lang)}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group relative p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${activeNoteId === note.id ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] shadow-sm hover:shadow-md'}`}
              style={activeNoteId === note.id ? { borderColor: prefs.themeColor } : { borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="font-bold text-[var(--text-main)] text-[15px] mb-1 truncate pr-6">{note.title || t('common.untitled', lang)}</h3>
              <p className="text-[var(--text-muted)] text-[13px] line-clamp-2 leading-relaxed mb-2">{stripHtml(note.content)}</p>
              
              <div className="flex items-center text-[11px] text-[var(--text-faint)] font-medium">
                <span>{formatDate(note.updatedAt)}</span>
                {note.folderId && !activeFolderId && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="flex items-center truncate max-w-[100px]"><FolderIcon className="w-3 h-3 mr-1 flex-shrink-0" /> <span className="truncate">{folders.find(f => f.id === note.folderId)?.name || t('common.unknown', lang)}</span></span>
                  </>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-faint)] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

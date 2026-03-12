import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Folder as FolderIcon, Hash, Flame, Plus, Trash2 } from 'lucide-react';
import { Folder, UserPreferences, Note } from '../types';
import { getGreeting, shortenName, getLast7DaysActivity } from '../utils';
import { t } from '../i18n';
import { Tooltip } from './Tooltip';

export const Sidebar = ({
  folders,
  activeFolderId,
  activeTag,
  onSelectFolder,
  onSelectTag,
  onCreateFolder,
  onDeleteFolder,
  onOpenSettings,
  prefs,
  streak,
  allTags,
  notes
}: {
  folders: Folder[];
  activeFolderId: string | null;
  activeTag: string | null;
  onSelectFolder: (id: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onOpenSettings: () => void;
  prefs: UserPreferences;
  streak: number;
  allTags: string[];
  notes: Note[];
}) => {
  const lang = prefs.language;
  const greeting = getGreeting();
  const shortName = shortenName(prefs.name);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');

  const activity = useMemo(() => getLast7DaysActivity(notes), [notes]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col h-full overflow-y-auto">
      <div className="p-5 flex items-center justify-between sticky top-0 bg-[var(--bg-secondary)]/90 backdrop-blur-md z-10">
        <div>
          <p className="text-[var(--text-muted)] text-[12px] font-medium mb-0.5 tracking-wide uppercase">{t(`main.greeting.${greeting}`, lang, { name: shortName })}</p>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] font-serif">{t('app.title', lang)}</h1>
        </div>
        <Tooltip content={`Settings (Cmd/Ctrl + ,)`} position="bottom">
          <button 
            onClick={onOpenSettings} 
            className="p-2 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="px-4 pb-6 space-y-6">
        {/* Streak Widget */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-[var(--bg-card)] p-3.5 rounded-2xl shadow-sm border border-[var(--border-subtle)] flex flex-col cursor-default"
        >
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 ${streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-[var(--bg-secondary)]'}`}>
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-[var(--text-faint)]'}`} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-[var(--text-main)] text-[14px]">
              {streak > 0 ? t('main.streak', lang, { count: streak }) : t('main.streak.empty', lang)}
            </h3>
          </div>
          
          <div className="flex justify-between items-end px-1">
            {activity.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div 
                  className={`w-4 h-4 rounded-sm transition-colors ${day.hasActivity ? 'bg-orange-500' : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)]'}`}
                  style={day.hasActivity ? { backgroundColor: prefs.themeColor } : {}}
                />
                <span className="text-[10px] font-medium text-[var(--text-faint)]">{day.dayName}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div>
          <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-2">{t('main.overview', lang)}</h3>
          <button
            onClick={() => { onSelectFolder(null); onSelectTag(null); }}
            className={`w-full flex items-center px-3 py-2 rounded-xl transition-colors ${activeFolderId === null && activeTag === null ? 'bg-[var(--bg-card)] shadow-sm border border-[var(--border-subtle)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50 border border-transparent'}`}
          >
            <FolderIcon className="w-4 h-4 mr-3" style={activeFolderId === null && activeTag === null ? { color: prefs.themeColor } : {}} />
            <span className="font-medium text-[14px]">{t('main.all_notes', lang)}</span>
          </button>
        </div>

        {/* Folders */}
        <div>
          <div className="flex items-center justify-between mb-2 ml-2 mr-1">
            <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('main.collections', lang)}</h3>
            <Tooltip content="New Folder" position="right">
              <button onClick={() => setIsCreating(true)} className="text-[var(--text-faint)] hover:text-[var(--text-main)]">
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
          <div className="space-y-1">
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`group relative w-full flex items-center px-3 py-2 rounded-xl transition-colors cursor-pointer ${activeFolderId === folder.id ? 'bg-[var(--bg-card)] shadow-sm border border-[var(--border-subtle)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50 border border-transparent'}`}
                onClick={() => { onSelectFolder(folder.id); onSelectTag(null); }}
              >
                <FolderIcon className="w-4 h-4 mr-3" style={activeFolderId === folder.id ? { color: prefs.themeColor } : {}} />
                <span className="font-medium text-[14px] truncate pr-6">{folder.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                  className="absolute right-2 p-1.5 rounded-lg text-[var(--text-faint)] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {isCreating && (
              <form onSubmit={handleCreateRequest} className="px-3 py-2">
                <input 
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={t('main.new_folder', lang)}
                  className="w-full outline-none text-[14px] font-medium text-[var(--text-main)] placeholder:text-[var(--text-faint)] bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--text-muted)] transition-colors"
                  autoFocus
                  onBlur={() => {
                    if(!newFolderName.trim()) setIsCreating(false);
                  }}
                />
              </form>
            )}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-2 flex items-center">
              <Hash className="w-3 h-3 mr-1" /> {t('main.tags', lang)}
            </h3>
            <div className="flex flex-wrap gap-1.5 px-2">
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => { onSelectTag(tag); onSelectFolder(null); }}
                  className={`px-2.5 py-1 border rounded-lg text-[12px] font-medium transition-colors shadow-sm ${activeTag === tag ? 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-subtle)]' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                  style={activeTag === tag ? { borderColor: prefs.themeColor, color: prefs.themeColor } : {}}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

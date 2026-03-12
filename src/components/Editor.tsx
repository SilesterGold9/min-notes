import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2, Maximize, Minimize, Bold, Italic, Underline, List, ListOrdered, CheckSquare, Download, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { GoogleGenAI, Type } from "@google/genai";
import { Note, UserPreferences } from '../types';
import { extractTags, getStats, vibrate, stripHtml } from '../utils';
import { Modal } from './Modal';
import { Tooltip } from './Tooltip';
import { t } from '../i18n';

export const Editor = ({ 
  note, 
  onSave, 
  onBack, 
  onDelete,
  prefs
}: { 
  note?: Note, 
  onSave: (n: Note) => void, 
  onBack: () => void, 
  onDelete: (id: string) => void,
  prefs: UserPreferences
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const lang = prefs.language;
  const noteRef = useRef(note);
  const titleRef = useRef(title);
  const editorRef = useRef<any>(null);
  
  const onSaveRef = useRef(onSave);
  
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      setSavingState('saving');
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    noteRef.current = note;
    titleRef.current = title;
  }, [note, title]);

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      if (noteRef.current && editorRef.current) {
        const html = editorRef.current.getHTML();
        const tags = extractTags(html);
        onSaveRef.current({ ...noteRef.current, title: titleRef.current, content: html, tags, updatedAt: Date.now() });
      }
    };
  }, []); // Only run on mount/unmount

  // Debounced auto-save
  useEffect(() => {
    if (!note || savingState !== 'saving') return;
    const timer = setTimeout(() => {
      const html = editor?.getHTML() || '';
      const tags = extractTags(html);
      onSaveRef.current({ ...note, title, content: html, tags, updatedAt: Date.now() });
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 2000);
    }, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [title, note, editor, savingState]);

  // Also trigger save when title changes
  useEffect(() => {
    if (note && title !== note.title) {
      setSavingState('saving');
    }
  }, [title, note]);

  // Zen Mode & Save Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setZenMode(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (editorRef.current && noteRef.current) {
          const html = editorRef.current.getHTML();
          const tags = extractTags(html);
          onSaveRef.current({ ...noteRef.current, title: titleRef.current, content: html, tags, updatedAt: Date.now() });
          setSavingState('saved');
          setTimeout(() => setSavingState('idle'), 2000);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMagic = async () => {
    if (!editor || isMagicLoading) return;
    const content = stripHtml(editor.getHTML());
    if (!content.trim()) return;

    setIsMagicLoading(true);
    vibrate([30, 50, 30]);

    try {
      const apiKey = prefs.geminiApiKey;
      if (!apiKey || apiKey.trim() === "") {
        console.error("GEMINI_API_KEY is missing or empty");
        alert("AI features are not configured. Please add your Gemini API key in the settings.");
        setIsMagicLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on the following note content, generate a short, creative title (max 5 words) and 3 relevant hashtags. Return as JSON: { "title": "...", "tags": ["#tag1", "#tag2", "#tag3"] }. Content: ${content}`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, creative title (max 5 words)" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 relevant hashtags" }
            }
          },
          temperature: 0.7,
        }
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      let result;
      try {
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        result = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse AI response:", response.text);
        throw new Error("Invalid response format from AI");
      }
      if (result.title) setTitle(result.title);
      if (result.tags && result.tags.length > 0) {
        const currentHtml = editor.getHTML();
        const tagsString = result.tags.join(' ');
        editor.commands.setContent(currentHtml + `<p>${tagsString}</p>`);
      }
      vibrate(100);
    } catch (error: any) {
      console.error("Magic failed:", error);
      alert(`AI Error: ${error.message || "Something went wrong"}`);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!note) return;
    // Simple HTML to Markdown conversion (basic)
    let md = editor?.getText() || '';
    if (title) md = `# ${title}\n\n${md}`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'untitled'}.md`;
    a.click();
  };

  const stats = useMemo(() => getStats(note?.content || ''), [note?.content]);
  const fontSizeClass = prefs.fontSize === 'small' ? 'text-[15px]' : prefs.fontSize === 'large' ? 'text-[21px]' : 'text-[18px]';

  if (!note) return <div className="flex flex-col h-full bg-[var(--bg-primary)]" />;

  return (
    <div className={`relative flex flex-col h-full transition-colors duration-700 ${zenMode ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-primary)]'}`}>
      <Modal 
        isOpen={confirmDeleteOpen} 
        onClose={() => setConfirmDeleteOpen(false)}
        title={t('editor.delete.title', lang)}
        actions={
          <>
            <button onClick={() => setConfirmDeleteOpen(false)} className="px-4 py-2 rounded-xl font-medium text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors">{t('editor.delete.cancel', lang)}</button>
            <button onClick={() => onDelete(note.id)} className="px-5 py-2 rounded-xl font-medium text-white shadow-md transition-transform active:scale-95 bg-red-500">{t('editor.delete.confirm', lang)}</button>
          </>
        }
      >
        <p>{t('editor.delete.desc', lang)}</p>
      </Modal>

      {/* Header */}
      <AnimatePresence>
        {!zenMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between px-6 py-4 bg-[var(--bg-primary)]/90 backdrop-blur-xl z-10 sticky top-0 border-b border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center text-[14px] active:opacity-70 transition-opacity p-1.5 pr-3 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <ChevronLeft className="w-5 h-5 mr-1" strokeWidth={2} />
                <span className="font-medium">{t('settings.back', lang)}</span>
              </button>
              
              <AnimatePresence>
                {savingState !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center text-[13px] text-[var(--text-faint)] font-medium bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full"
                  >
                    {savingState === 'saving' ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> {t('editor.saving', lang)}</>
                    ) : (
                      <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {t('editor.saved', lang)}</>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1">
              {prefs.enableAI && (
                <Tooltip content={t('editor.magic_title', lang)}>
                  <button 
                    onClick={handleMagic} 
                    disabled={isMagicLoading}
                    className={`p-2 active:opacity-70 transition-all rounded-full ${isMagicLoading ? 'animate-pulse text-[var(--text-main)] bg-[var(--bg-secondary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'}`}
                  >
                    {isMagicLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" style={{ color: isMagicLoading ? 'inherit' : prefs.themeColor }} strokeWidth={2} />}
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Export Markdown">
                <button onClick={() => { vibrate(); handleExportMarkdown(); }} className="p-2 active:opacity-70 transition-opacity text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] rounded-full">
                  <Download className="w-5 h-5" strokeWidth={2} />
                </button>
              </Tooltip>
              <Tooltip content="Zen Mode (Cmd/Ctrl + /)">
                <button onClick={() => { vibrate(); setZenMode(true); }} className="p-2 active:opacity-70 transition-opacity text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] rounded-full">
                  <Maximize className="w-5 h-5" strokeWidth={2} />
                </button>
              </Tooltip>
              <Tooltip content="Delete">
                <button onClick={() => { vibrate(); setConfirmDeleteOpen(true); }} className="p-2 active:opacity-70 transition-opacity text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full">
                  <Trash2 className="w-5 h-5" strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Exit Button */}
      <AnimatePresence>
        {zenMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            whileHover={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { vibrate(); setZenMode(false); }}
            className="absolute top-14 right-6 z-50 p-3 bg-[var(--bg-secondary)] rounded-full text-[var(--text-main)] shadow-sm transition-opacity"
            title="Exit Zen Mode (Cmd/Ctrl + /)"
          >
            <Minimize className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Editor Area */}
      <div className={`flex-1 overflow-y-auto px-8 flex flex-col transition-all duration-700 ${zenMode ? 'py-24 max-w-2xl mx-auto w-full' : 'py-6'}`}>
        <input
          type="text"
          placeholder={t('editor.placeholder', lang)}
          className="text-4xl font-bold tracking-tight text-[var(--text-main)] outline-none mb-2 placeholder:text-[var(--text-faint)] bg-transparent font-serif"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        
        <div className="flex items-center gap-4 text-[13px] text-[var(--text-faint)] mb-6 font-medium">
          <span>{stats.words} {t('editor.words', lang)}</span>
          <span>{stats.chars} {t('editor.chars', lang)}</span>
          <span>{stats.sentences} {t('editor.sentences', lang)}</span>
          <span>
            {stats.words > 0 
              ? (stats.readingTime > 1 
                  ? t('editor.reading_time', lang, { min: stats.readingTime }) 
                  : t('editor.reading_time_less', lang))
              : ''}
          </span>
        </div>

        <div className="flex-1 cursor-text" onClick={() => editor?.commands.focus()} style={{ '--theme-color': prefs.themeColor } as React.CSSProperties}>
          <EditorContent editor={editor} className={`h-full ${fontSizeClass} text-[var(--text-muted)] leading-relaxed font-sans`} />
        </div>
      </div>

      {/* Formatting Toolbar */}
      <AnimatePresence>
        {!zenMode && editor && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: '-50%' }} 
            animate={{ y: 0, opacity: 1, x: '-50%' }} 
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            className="absolute bottom-8 left-1/2 bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)] p-1.5 flex items-center gap-1 rounded-2xl shadow-xl z-50"
          >
            {[
              { icon: Bold, label: 'Bold', action: () => { vibrate(20); editor.chain().focus().toggleBold().run(); }, active: editor.isActive('bold') },
              { icon: Italic, label: 'Italic', action: () => { vibrate(20); editor.chain().focus().toggleItalic().run(); }, active: editor.isActive('italic') },
              { icon: Underline, label: 'Underline', action: () => { vibrate(20); editor.chain().focus().toggleUnderline().run(); }, active: editor.isActive('underline') },
              { divider: true },
              { icon: List, label: 'Bullet List', action: () => { vibrate(20); editor.chain().focus().toggleBulletList().run(); }, active: editor.isActive('bulletList') },
              { icon: ListOrdered, label: 'Numbered List', action: () => { vibrate(20); editor.chain().focus().toggleOrderedList().run(); }, active: editor.isActive('orderedList') },
              { icon: CheckSquare, label: 'Task List', action: () => { vibrate(20); editor.chain().focus().toggleTaskList().run(); }, active: editor.isActive('taskList') },
            ].map((item, i) => item.divider ? (
              <div key={i} className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>
            ) : (
              <Tooltip key={i} content={item.label!} position="top">
                <button
                  onClick={item.action}
                  className={`p-2 rounded-xl transition-all ${item.active ? 'bg-[var(--bg-secondary)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'}`}
                  style={item.active ? { color: prefs.themeColor } : {}}
                >
                  {item.icon && <item.icon className="w-4 h-4" strokeWidth={2.5} />}
                </button>
              </Tooltip>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SquarePen, Command, Maximize, Sparkles, Check, Moon, Sun, Keyboard, Zap, ArrowRight, Focus } from 'lucide-react';
import { UserPreferences } from '../types';
import { THEME_COLORS } from '../utils';

export const Onboarding = ({ onComplete }: { onComplete: (prefs: UserPreferences) => void }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].value);
  const [darkMode, setDarkMode] = useState(true);
  const [enableAI, setEnableAI] = useState(true);

  // Apply dark mode to document body for preview
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4 && name.trim()) setStep(5);
    else if (step === 5) {
      onComplete({ 
        name: name.trim(), 
        themeColor, 
        darkMode, 
        language: 'en', 
        fontSize: 'medium', 
        enableAI, 
        showSplash: true 
      });
    }
  };

  const RightPanelVisual = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-white"
          >
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <SquarePen className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-serif font-bold tracking-tight">MinNotes</h2>
            <p className="text-white/70 mt-4 font-medium tracking-wide uppercase text-sm">Desktop Edition</p>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto space-y-4"
          >
            {[
              { icon: Command, label: 'Command Palette', shortcut: '⌘ K', desc: 'Search notes, switch themes, open settings.' },
              { icon: Focus, label: 'Zen Mode', shortcut: '⌘ /', desc: 'Hide all distractions and focus on writing.' },
              { icon: SquarePen, label: 'Quick Note', shortcut: '⌘ N', desc: 'Instantly create a new note from anywhere.' },
              { icon: Zap, label: 'Global Search', shortcut: '⌘ F', desc: 'Find anything across all your notes instantly.' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center justify-between text-white shadow-lg"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4">
                    <item.icon className="w-5 h-5 opacity-90" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px]">{item.label}</span>
                    <span className="text-white/60 text-[12px]">{item.desc}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-black/40 rounded-lg text-xs font-mono tracking-widest font-bold shadow-inner border border-white/10">{item.shortcut}</div>
              </motion.div>
            ))}
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto"
          >
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center mr-4 border border-yellow-400/30">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">AI Assistant</span>
                  <span className="text-white/60 text-sm">Powered by Gemini</span>
                </div>
              </div>
              <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/10">
                <div className="h-4 w-3/4 bg-white/20 rounded-full animate-pulse"></div>
                <div className="h-4 w-full bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="h-4 w-5/6 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 flex flex-col gap-3">
                <span className="text-sm font-medium text-white/80">Auto-generated tags:</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold shadow-sm">#ideas</span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold shadow-sm">#writing</span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold shadow-sm">#journal</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto"
          >
            <div className="w-full aspect-[4/3] bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col transition-colors duration-500 relative">
              <div className="absolute inset-0 pointer-events-none border-[8px] border-black/5 dark:border-white/5 rounded-2xl z-20"></div>
              <div className="h-12 border-b border-[var(--border-subtle)] flex items-center px-4 gap-2 bg-[var(--bg-secondary)]">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
              </div>
              <div className="flex-1 flex">
                <div className="w-1/3 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
                  <div className="h-4 w-1/2 rounded-full mb-6 shadow-sm" style={{ backgroundColor: themeColor }}></div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-[var(--border-subtle)] rounded-full"></div>
                    <div className="h-3 w-3/4 bg-[var(--border-subtle)] rounded-full"></div>
                    <div className="h-3 w-5/6 bg-[var(--border-subtle)] rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 p-8 bg-[var(--bg-primary)]">
                  <div className="h-8 w-3/4 bg-[var(--text-main)] rounded-lg mb-8 opacity-20"></div>
                  <div className="space-y-4">
                    <div className="h-3 w-full bg-[var(--text-muted)] rounded-full opacity-20"></div>
                    <div className="h-3 w-5/6 bg-[var(--text-muted)] rounded-full opacity-20"></div>
                    <div className="h-3 w-full bg-[var(--text-muted)] rounded-full opacity-20"></div>
                    <div className="h-3 w-4/6 bg-[var(--text-muted)] rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center justify-center h-full text-white"
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-8 shadow-2xl">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight font-serif">You're all set!</h2>
            <p className="text-white/70 mt-4 font-medium text-lg">Your workspace is ready.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-main)] overflow-hidden">
      {/* Left Panel - Content */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-10 md:px-16 lg:px-24 relative z-10">
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">
                  Welcome
                </div>
                <h1 className="text-5xl font-bold tracking-tight mb-6 font-serif leading-tight">A sanctuary for your thoughts.</h1>
                <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-12">
                  MinNotes is a beautifully minimal, lightning-fast desktop note-taking experience designed to get out of your way.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-[var(--border-subtle)] shadow-sm">
                  <Keyboard className="w-7 h-7 text-[var(--text-main)]" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-serif">Keyboard First.</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  Keep your hands on the keys. Navigate, search, and create at the speed of thought using the Command Palette and global shortcuts.
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-[var(--border-subtle)] shadow-sm">
                  <Sparkles className="w-7 h-7 text-[var(--text-main)]" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-serif">AI Magic.</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  Your intelligent writing assistant. MinNotes can automatically generate creative titles and relevant tags based on your content.
                </p>
                
                <div 
                  onClick={() => setEnableAI(!enableAI)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${enableAI ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent'}`}
                  style={{ borderColor: enableAI ? themeColor : 'transparent' }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[16px] text-[var(--text-main)]">Enable AI Features</span>
                    <span className="text-[13px] text-[var(--text-muted)] mt-1">You can change this later in settings.</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${enableAI ? 'bg-green-500 border-green-500' : 'border-[var(--text-faint)]'}`}>
                    {enableAI && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-serif">Make it yours.</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  Personalize your workspace.
                </p>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">Your Name</label>
                    <input 
                      type="text"
                      placeholder="How should we call you?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] rounded-xl px-5 py-4 text-[16px] outline-none focus:ring-2 transition-all text-[var(--text-main)] placeholder:text-[var(--text-faint)] border border-[var(--border-subtle)] shadow-sm"
                      style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">Theme Color</label>
                    <div className="flex gap-4 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setThemeColor(color.value)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${themeColor === color.value ? 'scale-110 shadow-md ring-2 ring-offset-2' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color.value, '--tw-ring-color': color.value, '--tw-ring-offset-color': 'var(--bg-secondary)' } as React.CSSProperties}
                        >
                          {themeColor === color.value && <Check className="w-5 h-5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">Appearance</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${!darkMode ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                        style={{ borderColor: !darkMode ? themeColor : 'transparent' }}
                      >
                        <Sun className={`w-6 h-6 ${!darkMode ? 'text-[var(--text-main)]' : ''}`} /> 
                        <span className="font-bold text-[14px]">Light Mode</span>
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${darkMode ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                        style={{ borderColor: darkMode ? themeColor : 'transparent' }}
                      >
                        <Moon className={`w-6 h-6 ${darkMode ? 'text-[var(--text-main)]' : ''}`} /> 
                        <span className="font-bold text-[14px]">Dark Mode</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-5xl font-bold tracking-tight mb-6 font-serif">Welcome, {name}.</h2>
                <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-12">
                  Your workspace is configured and ready. Let's start writing.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pb-12 pt-8 flex items-center justify-between border-t border-[var(--border-subtle)]">
          <div className="flex gap-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-10' : 'w-2 opacity-30'}`}
                style={{ backgroundColor: step === i ? themeColor : 'var(--text-muted)' }}
              />
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={step === 4 && !name.trim()}
            className="px-8 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-[15px]"
            style={{ backgroundColor: themeColor }}
          >
            {step === 5 ? 'Enter Workspace' : 'Continue'}
            {step !== 5 && <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />}
          </motion.button>
        </div>
      </div>

      {/* Right Panel - Visuals */}
      <div 
        className="hidden md:block w-1/2 h-full relative overflow-hidden transition-colors duration-700 shadow-2xl"
        style={{ backgroundColor: themeColor }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -mr-96 -mt-96"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/10 rounded-full blur-3xl -ml-64 -mb-64"></div>
        
        <div className="relative z-10 h-full w-full p-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <RightPanelVisual key={`visual-${step}`} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

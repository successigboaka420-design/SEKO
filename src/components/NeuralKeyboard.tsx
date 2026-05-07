import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Delete, ArrowUp, Globe, Smile, Type } from 'lucide-react';
import { AppleEmoji, GEN_EMOJIS } from './GlassUI';

interface NeuralKeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  onClose: () => void;
  config: { color: string };
}

export const NeuralKeyboard: React.FC<NeuralKeyboardProps> = ({ onInput, onDelete, onEnter, onClose, config }) => {
  const [layout, setLayout] = useState<'alpha' | 'emoji' | 'symbols'>('alpha');
  const [isShift, setIsShift] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Faces');

  const categories = [
    { id: 'Faces', icon: '😀' },
    { id: 'Hands', icon: '🫶' },
    { id: 'Nature', icon: '🌿' },
    { id: 'Food', icon: '🍎' },
    { id: 'Activity', icon: '⚽' }
  ];

  const getCategorizedEmojis = () => {
    switch (activeCategory) {
      case 'Faces': return GEN_EMOJIS.slice(0, 70);
      case 'Hands': return GEN_EMOJIS.slice(70, 143);
      case 'Nature': return GEN_EMOJIS.slice(143, 188);
      case 'Food': return GEN_EMOJIS.slice(188, 290);
      case 'Activity': return GEN_EMOJIS.slice(290);
      default: return GEN_EMOJIS;
    }
  };

  const alphaRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACKSPACE'],
    ['123', 'EMOJI', 'SPACE', 'ENTER']
  ];

  const symbolRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '&', '@', '"', '.'],
    ['#+=', '_', ',', '?', '!', "'", 'BACKSPACE'],
    ['ABC', 'EMOJI', 'SPACE', 'ENTER']
  ];

  const [previewKey, setPreviewKey] = useState<string | null>(null);

  const handleKeyClick = (key: string) => {
    setPreviewKey(key);
    setTimeout(() => setPreviewKey(null), 100);

    if (key === 'SHIFT') {
      setIsShift(!isShift);
    } else if (key === 'BACKSPACE') {
      onDelete();
    } else if (key === 'SPACE') {
      onInput(' ');
    } else if (key === 'ENTER') {
      onEnter();
    } else if (key === 'EMOJI') {
      setLayout('emoji');
    } else if (key === '123' || key === '#+=') {
      setLayout('symbols');
    } else if (key === 'ABC') {
      setLayout('alpha');
    } else {
      onInput(isShift ? key.toUpperCase() : key);
      if (isShift) setIsShift(false);
    }
  };

  const renderAlphaOrSymbols = () => {
    const rows = layout === 'symbols' ? symbolRows : alphaRows;

    return (
      <motion.div
        key={layout}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="flex flex-col gap-[1.5vw] sm:gap-2 w-full select-none"
      >
        {rows.map((row, rowIdx) => (
          <div 
            key={rowIdx} 
            className={`flex justify-center gap-[1vw] sm:gap-1.5 w-full ${
              rowIdx === 1 ? 'px-[5%]' : ''
            }`}
          >
            {row.map((key) => {
              const specialKeys = ['SHIFT', 'BACKSPACE', 'EMOJI', 'SPACE', 'ENTER', '123', 'ABC', '#+='];
              const isSpecial = specialKeys.includes(key);
              let content: React.ReactNode = isShift ? key.toUpperCase() : key;
              let flexValue = "1";
              
              if (key === 'SHIFT') {
                content = <ArrowUp size={20} className={isShift ? 'text-white' : 'text-white/40'} strokeWidth={3} />;
                flexValue = "1.5";
              }
              if (key === 'BACKSPACE') {
                content = <Delete size={20} className="text-white/80" strokeWidth={2.5} />;
                flexValue = "1.5";
              }
              if (key === 'EMOJI') {
                content = <Smile size={20} />;
                flexValue = "1.25";
              }
              if (key === 'SPACE') {
                content = <span className="text-[10px] sm:text-xs opacity-50 font-bold uppercase tracking-widest">Space</span>;
                flexValue = "5";
              }
              if (key === 'ENTER') {
                content = <span className="text-[10px] sm:text-xs font-black uppercase tracking-tighter">Sync</span>;
                flexValue = "2";
              }
              if (['123', 'ABC', '#+='].includes(key)) {
                content = key;
                flexValue = "1.5";
              }

              return (
                <div key={key} className="relative flex-1 flex" style={{ flex: flexValue }}>
                  <AnimatePresence>
                    {previewKey === key && !isSpecial && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 0 }}
                        animate={{ opacity: 1, scale: 1.1, y: -50 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute inset-x-0 bottom-full flex justify-center z-50 pointer-events-none"
                      >
                        <div className="bg-white text-black w-14 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl border-2 border-white/20">
                          {isShift ? key.toUpperCase() : key}
                          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyClick(key);
                    }}
                    className={`
                      w-full h-[clamp(42px,7vh,56px)] rounded-lg flex items-center justify-center font-bold transition-all active:scale-95 active:brightness-[1.4]
                      ${isSpecial && !['123', 'ABC', '#+='].includes(key) ? 'bg-white/10 text-white shadow-none' : ''}
                      ${!isSpecial || ['123', 'ABC', '#+='].includes(key) ? 'bg-white text-black shadow-[0_2px_0_rgba(0,0,0,0.2)]' : ''}
                      ${key === 'ABC' || key === '123' || key === '#+=' ? 'text-[12px] sm:text-sm' : (isSpecial ? 'text-[10px]' : 'text-lg sm:text-xl')}
                      ${key === 'SHIFT' && isShift ? 'bg-pink-600 text-white ring-1 ring-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]' : ''}
                      ${key === 'ENTER' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white border-none shadow-[0_4px_15px_rgba(236,72,153,0.3)]' : ''}
                    `}
                    style={{
                      minWidth: 0,
                      touchAction: 'manipulation'
                    }}
                  >
                    {content}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full z-[100] mt-auto relative overflow-hidden shrink-0"
      transition={{ 
        type: 'spring', 
        damping: 38, 
        stiffness: 400, 
        mass: 1
      }}
    >
      <div 
        className="w-full max-w-2xl mx-auto rounded-t-[2.5rem] border-t border-white/10 overflow-hidden shadow-[0_-30px_60px_-10px_rgba(0,0,0,0.8)] pb-safe"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.98)',
          backdropFilter: 'blur(160px) saturate(220%)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 12px)'
        }}
      >
        {/* Superior Branding Bar */}
        <div className="flex items-center justify-between px-7 py-3.5 border-b border-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]" />
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.4s]" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">Neural Input Protocol</span>
          </div>
          <div className="flex items-center gap-5">
             <button 
              onPointerDown={() => setLayout(layout === 'emoji' ? 'alpha' : 'emoji')}
              className="text-white/40 hover:text-white transition-colors active:scale-90"
            >
              {layout === 'emoji' ? <Type size={16} /> : <Smile size={16} />}
            </button>
            <button 
              onPointerDown={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white active:scale-90"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-3 sm:px-5">
          <AnimatePresence mode="wait">
            {layout === 'emoji' ? (
              <motion.div
                key="emoji"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-4 h-full"
              >
                <div className="flex gap-2.5 p-1 overflow-x-auto no-scrollbar scroll-smooth">
                  <button 
                    onPointerDown={() => setLayout('alpha')}
                    className="h-10 px-4 rounded-xl bg-white/10 text-white flex items-center gap-2 shrink-0 hover:bg-white/15 active:scale-95 transition-all"
                  >
                    <Type size={15} />
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onPointerDown={() => setActiveCategory(cat.id)}
                      className={`h-10 px-4 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${
                        activeCategory === cat.id 
                          ? 'bg-white text-black border-white shadow-[0_5px_15px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
                      } active:scale-90`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">{cat.id}</span>
                    </button>
                  ))}
                  <button 
                    onPointerDown={() => onDelete()}
                    className="h-10 px-4 rounded-xl bg-white/10 text-white flex items-center ml-auto shrink-0 hover:bg-white/15 active:scale-90"
                  >
                    <Delete size={15} />
                  </button>
                </div>
                
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 h-[220px] overflow-y-auto no-scrollbar pb-4 px-1 scroll-smooth">
                  {getCategorizedEmojis().map((emoji, idx) => (
                    <button
                      key={idx}
                      onPointerDown={() => onInput(emoji)}
                      className="aspect-square flex items-center justify-center hover:bg-white/10 rounded-xl transition-all active:scale-90"
                    >
                      <AppleEmoji emoji={emoji} size={24} />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : renderAlphaOrSymbols()}
          </AnimatePresence>
        </div>

        {/* Ergonomic Navigation Indicator */}
        <div className="h-2 flex items-center justify-center opacity-10 mt-1 mb-2">
          <div className="w-16 h-1 rounded-full bg-white transition-all group-hover:w-20" />
        </div>
      </div>
    </motion.div>
  );
};

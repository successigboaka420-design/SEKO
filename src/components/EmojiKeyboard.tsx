import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppleEmoji, GEN_EMOJIS } from './GlassUI';
import { X, Palette, Layout as LayoutIcon, Sliders } from 'lucide-react';
import { Badge } from './ui/badge';

interface EmojiKeyboardProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  config: {
    color: string;
    layout: 'default' | 'compact' | 'wide';
    glassIntensity: 'low' | 'medium' | 'high';
  };
}

export const EmojiKeyboard: React.FC<EmojiKeyboardProps> = ({ onEmojiSelect, onClose, config }) => {
  const [activeCategory, setActiveCategory] = React.useState('Faces');
  
  const categories = [
    { id: 'Faces', icon: '😀', label: 'Faces' },
    { id: 'Hands', icon: '🫶', label: 'Hands' },
    { id: 'Nature', icon: '🌿', label: 'Nature' },
    { id: 'Food', icon: '🍎', label: 'Food' },
    { id: 'Activity', icon: '⚽', label: 'Sport' }
  ];

  const getCategorizedEmojis = () => {
    // Basic slicing of the main GEN_EMOJIS array based on the categories defined in GlassUI
    switch (activeCategory) {
      case 'Faces': return GEN_EMOJIS.slice(0, 70);
      case 'Hands': return GEN_EMOJIS.slice(70, 143);
      case 'Nature': return GEN_EMOJIS.slice(143, 188);
      case 'Food': return GEN_EMOJIS.slice(188, 290);
      case 'Activity': return GEN_EMOJIS.slice(290);
      default: return GEN_EMOJIS;
    }
  };

  const currentEmojis = getCategorizedEmojis();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="w-full rounded-[2.5rem] border shadow-2xl relative overflow-hidden flex flex-col h-[380px]"
      style={{ 
        borderColor: `${config.color}22`,
        backgroundColor: `rgba(0,0,0,0.85)`,
        backdropFilter: 'blur(60px) saturate(200%)',
        boxShadow: `0 30px 60px -12px rgba(0,0,0,0.6), inset 0 1px 1px 0 rgba(255,255,255,0.15)`
      }}
    >
      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between p-5 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Neural Input Layer</span>
          <span className="text-sm font-bold text-white tracking-tight">Emoji Protocol</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all bg-white/5 text-white shadow-lg active:scale-95"
        >
          <X size={18} />
        </button>
      </div>

      {/* Category Selection */}
      <div className="flex px-4 gap-2 mb-2 relative z-10 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all whitespace-nowrap border ${
              activeCategory === cat.id 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-5 pt-2 relative z-10">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-4">
          {currentEmojis.map((emoji, index) => (
            <motion.button
              key={index}
              whileHover={{ 
                scale: 1.3, 
                zIndex: 20,
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEmojiSelect(emoji)}
              className="aspect-square flex items-center justify-center transition-all duration-300 relative rounded-2xl hover:bg-white/10"
            >
              <AppleEmoji emoji={emoji} size={36} />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 flex items-center justify-center relative z-10">
        <div className="h-1.5 w-12 rounded-full bg-white/20" />
      </div>
    </motion.div>
  );
};

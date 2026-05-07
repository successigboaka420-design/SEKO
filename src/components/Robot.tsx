import React from 'react';
import { motion, useAnimation } from 'motion/react';
import { Bot } from 'lucide-react';

interface RobotProps {
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  config?: {
    color: string;
    eyeStyle: string;
    skin?: string;
    palette?: string;
  };
}

export const Robot: React.FC<RobotProps> = ({ status, config }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    if (status === 'thinking') {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 1 }
      });
    } else if (status === 'speaking') {
      controls.start({
        y: [0, -10, 0],
        transition: { repeat: Infinity, duration: 0.5 }
      });
    } else if (status === 'listening') {
      controls.start({
        opacity: [0.5, 1, 0.5],
        transition: { repeat: Infinity, duration: 1.5 }
      });
    } else {
      controls.stop();
      controls.start({ scale: 1, y: 0, opacity: 1 });
    }
  }, [status]);

  const paletteColors: Record<string, string> = {
    purple: '#a855f7',
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    cyberpunk: '#ec4899'
  };

  const primaryColor = paletteColors[config?.palette || ''] || config?.color || '#a855f7';

  const getSkinStyles = () => {
    switch (config?.skin) {
      case 'chrome':
        return 'bg-gradient-to-br from-slate-300 to-slate-500 border-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]';
      case 'gold':
        return 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-200/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]';
      case 'neon':
        return 'bg-transparent border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] backdrop-blur-md';
      case 'carbon':
        return 'bg-zinc-900 border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]';
      default:
        return 'bg-white/[0.03] backdrop-blur-3xl border-white/[0.08] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.1)]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={controls}
        className={`relative w-32 h-32 flex items-center justify-center rounded-full transition-all duration-700 ${getSkinStyles()}`}
        style={{ borderColor: status === 'idle' ? 'rgba(255,255,255,0.05)' : primaryColor }}
      >
        <Bot 
          size={64} 
          style={{ 
            color: config?.skin === 'neon' ? 'white' : primaryColor,
            filter: config?.skin === 'neon' ? `drop-shadow(0 0 10px ${primaryColor})` : undefined
          }} 
        />
        
        {/* Glowing Eyes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 w-full justify-center">
            <motion.div 
               animate={{ scaleY: status === 'thinking' ? [1, 0.1, 1] : 1 }}
               transition={{ repeat: Infinity, duration: 2 }}
               className={`w-3 h-3 rounded-full bg-white shadow-[0_0_8px_white] ${config?.skin === 'neon' ? 'opacity-90' : ''}`} 
            />
            <motion.div 
               animate={{ scaleY: status === 'thinking' ? [1, 0.1, 1] : 1 }}
               transition={{ repeat: Infinity, duration: 2 }}
               className={`w-3 h-3 rounded-full bg-white shadow-[0_0_8px_white] ${config?.skin === 'neon' ? 'opacity-90' : ''}`} 
            />
        </div>

        {/* Orbiting particles removed */}
      </motion.div>
      
      <p className={`mt-4 text-sm font-mono tracking-widest uppercase neon-text transition-colors duration-500 ${
        config?.skin === 'carbon' ? 'text-zinc-500' : 'text-muted-foreground'
      }`} style={{ color: config?.skin === 'carbon' ? undefined : primaryColor }}>
        {status}
      </p>
    </div>
  );
};

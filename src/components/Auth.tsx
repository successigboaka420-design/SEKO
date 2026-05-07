import React from 'react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { GlassCard } from './GlassUI';
import { Button } from './ui/button';
import { Sparkles, ShieldCheck, Globe } from 'lucide-react';

export const Auth: React.FC = () => {
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 sm:p-8 overflow-y-auto bg-black relative touch-pan-y custom-scrollbar">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-500/10 via-transparent to-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full my-auto mx-auto relative z-10 py-12">
        <GlassCard className="text-center py-12 px-6 sm:py-20 sm:px-10 relative overflow-hidden group border-white/10">
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-[2.5rem] mx-auto mb-10 neon-glow flex items-center justify-center relative z-10 shadow-2xl scale-110 active:scale-95 transition-transform duration-500">
            <Sparkles size={48} className="text-white animate-pulse" />
          </div>
          
          <h1 className="text-6xl font-black mb-2 tracking-tighter italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">SEKO</h1>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.6em] mb-14 opacity-80">Sentient Kinetic Organism</p>
          
          <div className="space-y-6 relative z-10">
            <Button 
              onClick={login} 
              className="w-full h-16 rounded-[2rem] bg-white text-black hover:bg-slate-100 font-black tracking-[0.2em] text-[10px] shadow-[0_10px_40px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] hover:-translate-y-1 active:scale-95 active:translate-y-0"
            >
              INITIALIZE SYNC (GOOGLE)
            </Button>
            
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
              <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Secure Link</span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
                <Globe size={18} className="text-blue-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Global Node</span>
              </div>
            </div>

            <p className="text-[9px] text-slate-500 font-bold px-4 leading-relaxed uppercase tracking-widest opacity-60">
              By connecting, you join the neural collective and agree to our <span className="text-primary underline cursor-pointer hover:text-white transition-colors">Protocol Terms</span>.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

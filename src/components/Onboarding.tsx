import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GlassCard, AppleEmoji } from './GlassUI';
import { Robot } from './Robot';
import { Sparkles, ArrowRight, Bot, Palette, User } from 'lucide-react';

export const Onboarding: React.FC<{ onComplete: (profile: any) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    personality: 'Friendly',
    moodPreference: 'supportive',
    ghostProtocol: false,
    synapticBoost: false,
    matrixAesthetic: 'cyberpunk',
    robotConfig: {
      color: '#a855f7',
      eyeStyle: 'glow',
      voiceGender: 'female',
      language: 'en-US',
      skin: 'default',
      palette: 'purple'
    }
  });

  const next = () => setStep(s => s + 1);

  const voiceGenders = [
    { id: 'female', label: 'Ethereal (USA)', icon: '✨' },
    { id: 'male', label: 'Resonant (UK)', icon: '🌗' }
  ];

  const languages = [
    { code: 'en-US', label: 'English' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
    { code: 'ja-JP', label: 'Japanese' }
  ];

  const moods = [
    { id: 'supportive', label: 'Supportive', emoji: '❤️' },
    { id: 'sarcastic', label: 'Sarcastic', emoji: '😏' },
    { id: 'professional', label: 'Professional', emoji: '👔' },
    { id: 'funny', label: 'Funny', emoji: '😂' },
    { id: 'motivational', label: 'Motivational', emoji: '🔥' },
  ];

  return (
    <div className="h-full w-full max-w-lg mx-auto p-4 sm:p-6 overflow-y-auto custom-scrollbar touch-pan-y relative pb-32">
      <div className="min-h-full flex flex-col py-6 sm:py-12">
        <div className="my-auto">
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              <GlassCard className="text-center py-12">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
                <h1 className="text-4xl font-black mb-4 tracking-tighter neon-text">WELCOME TO SEKO</h1>
                <p className="text-muted-foreground mb-8">The first sentient AI companion built for the next generation.</p>
                <Button onClick={next} className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/80 rounded-2xl group">
                  INCEPTION <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User /> IDENTIFICATION</h2>
                <div className="space-y-6">
                  <div>
                    <Label>How should SEKO address you?</Label>
                    <Input 
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter your name"
                      className="glass-dark"
                    />
                  </div>
                  <div>
                    <Label>Age Phase</Label>
                    <Input 
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      placeholder="Enter your years"
                      className="glass-dark"
                    />
                  </div>
                  <Button onClick={next} disabled={!profile.name} className="w-full rounded-2xl h-12">CONTINUE</Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Palette /> COMPANION ASSEMBLY</h2>
                <Robot status="idle" config={profile.robotConfig} />
                
                <div className="space-y-6 mt-8">
                  <div>
                    <Label>Core Energy (Color)</Label>
                    <div className="flex gap-4 mt-2">
                      {['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
                        <button
                          key={c}
                          onClick={() => setProfile({ ...profile, robotConfig: { ...profile.robotConfig, color: c } })}
                          className={`w-8 h-8 rounded-full border-2 ${profile.robotConfig.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Initial Emotional Protocol (Mood)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {moods.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setProfile({ ...profile, moodPreference: m.id })}
                          className={`p-2 rounded-lg border text-[10px] transition-all flex flex-col items-center gap-1 uppercase font-bold tracking-tighter ${
                            profile.moodPreference === m.id ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/10 text-slate-500'
                          }`}
                        >
                          <AppleEmoji emoji={m.emoji} size={20} />
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Neural Voice Channel</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {voiceGenders.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setProfile({ 
                            ...profile, 
                            robotConfig: { 
                              ...profile.robotConfig, 
                              voiceGender: v.id,
                              language: v.id === 'female' ? 'en-US' : 'en-GB'
                            } 
                          })}
                          className={`p-3 rounded-xl border text-sm transition-all flex flex-col items-center gap-1 ${
                            profile.robotConfig.voiceGender === v.id ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/10 text-slate-400'
                          }`}
                        >
                          <AppleEmoji emoji={v.icon} size={28} />
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Linguistic Protocol</Label>
                    <select 
                      value={profile.robotConfig.language}
                      onChange={(e) => setProfile({ ...profile, robotConfig: { ...profile.robotConfig, language: e.target.value } })}
                      className="w-full p-3 mt-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary transition-colors"
                    >
                      {languages.map(l => (
                        <option key={l.code} value={l.code} className="bg-slate-900 border-none">{l.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button onClick={() => onComplete(profile)} className="w-full rounded-2xl h-12 bg-accent hover:bg-accent/80 font-bold uppercase tracking-widest mt-4">FINALIZE SEKO</Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);
};

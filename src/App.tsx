/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged } from './lib/firebase';
import { doc, getDoc, setDoc, getDocFromServer, collection, query, orderBy, limit, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Chat } from './components/Chat';
import { Dashboard } from './components/Dashboard';
import { Journal } from './components/Journal';
import { BackgroundParticles } from './components/BackgroundParticles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { MessageSquare, LayoutDashboard, Crown, Sparkles as SparklesIcon, Brain, LogOut, Palette, Bot, Settings, Mic2, Heart, Zap, Ghost, GraduationCap, ShieldCheck, EyeOff, Activity, Keyboard as KeyboardIcon, Layers, Layout as LayoutIcon, MoreVertical, History, Plus, Trash2, Clock, BookOpen } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { AppleEmoji, EmojiText } from './components/GlassUI';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import { Label } from './components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './components/ui/dropdown-menu';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

const MotionDropdownMenuTrigger = motion(DropdownMenuTrigger);
const MotionButton = motion(Button);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showRobotSettings, setShowRobotSettings] = useState(false);
  const [showKeyboardSettings, setShowKeyboardSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'journal'>('chat');

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      try {
        if (u) {
          const docRef = doc(db, 'users', u.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setProfile(snap.data());
          }

          // Fetch Sessions
          const sessionsPath = `users/${u.uid}/sessions`;
          const sQuery = query(collection(db, 'users', u.uid, 'sessions'), orderBy('updatedAt', 'desc'));
          const unsubSessions = onSnapshot(sQuery, (snapshot) => {
            const fetchedSessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setSessions(fetchedSessions);
          }, (error) => {
            if (auth.currentUser?.uid === u.uid) {
              handleFirestoreError(error, OperationType.GET, sessionsPath);
            }
          });

          // Fetch Memories for the Profile Dropdown
          const memQuery = query(collection(db, 'users', u.uid, 'memories'), orderBy('timestamp', 'desc'), limit(5));
          const unsubMemories = onSnapshot(memQuery, (snapshot) => {
            setMemories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          }, (error) => {
             if (auth.currentUser?.uid === u.uid) {
                console.error("Memories sync error", error);
             }
          });

          // Note: Unsubscribes are handled by the caller of onAuthStateChanged normally
          // but we can't easily return a multi-layered cleanup here.
          // The auth listener itself returns the unsubscribe for auth.
        }
      } catch (error) {
        console.error("Initialization error:", error);
        // We still want to stop loading
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const handleOnboardingComplete = async (newProfile: any) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const finalProfile = { ...newProfile, userId: user.uid, premium: false };
      await setDoc(doc(db, 'users', user.uid), finalProfile);
      setProfile(finalProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateProfile = async (updates: any) => {
    if (!user || !profile) return;
    const path = `users/${user.uid}`;
    try {
      const updatedProfile = { ...profile, ...updates };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
      toast.success("Profile Synchronized");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const moods = [
    { id: 'supportive', label: 'Supportive', icon: <AppleEmoji emoji="❤️" size={20} />, premium: false },
    { id: 'sarcastic', label: 'Sarcastic', icon: <AppleEmoji emoji="😏" size={20} />, premium: false },
    { id: 'professional', label: 'Professional', icon: <AppleEmoji emoji="💼" size={20} />, premium: false },
    { id: 'slang', label: 'Slang', icon: <AppleEmoji emoji="😎" size={20} />, premium: false },
    { id: 'funny', label: 'Funny', icon: <AppleEmoji emoji="😂" size={20} />, premium: false },
    { id: 'motivational', label: 'Motivational', icon: <AppleEmoji emoji="🔥" size={20} />, premium: false },
    { id: 'chill', label: 'Chill', icon: <AppleEmoji emoji="🌊" size={20} />, premium: false },
    { id: 'aggressive', label: 'Aggressive', icon: <AppleEmoji emoji="😤" size={20} />, premium: false },
    { id: 'intellectual', label: 'Intellectual', icon: <AppleEmoji emoji="🎓" size={20} />, premium: false },
    { id: 'flirty', label: 'Flirty', icon: <AppleEmoji emoji="😘" size={20} />, premium: false },
    { id: 'protective', icon: <AppleEmoji emoji="🛡️" size={20} />, label: 'Protective', premium: false },
    { id: 'dark', label: 'Dark', icon: <AppleEmoji emoji="👻" size={20} />, premium: true },
    { id: 'divine', label: 'Divine', icon: <AppleEmoji emoji="✨" size={20} />, premium: true },
    { id: 'demon', label: 'Demon', icon: <AppleEmoji emoji="😈" size={20} />, premium: true },
    { id: 'godlike', label: 'Godlike', icon: <AppleEmoji emoji="⚡" size={20} />, premium: true },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: <AppleEmoji emoji="🌃" size={20} />, premium: true },
    { id: 'ancient', label: 'Ancient', icon: <AppleEmoji emoji="📜" size={20} />, premium: true },
    { id: 'alien', label: 'Alien', icon: <AppleEmoji emoji="👽" size={20} />, premium: true },
    { id: 'vampire', label: 'Vampire', icon: <AppleEmoji emoji="🧛" size={20} />, premium: true },
    { id: 'romantic', label: 'Romantic', icon: <AppleEmoji emoji="❤️" size={20} />, premium: true },
    { id: 'therapist', label: 'Therapist', icon: <AppleEmoji emoji="🧠" size={20} />, premium: true },
    { id: 'mentor', label: 'Mentor', icon: <AppleEmoji emoji="🦉" size={20} />, premium: true },
  ];

  if (loading) return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-black">
      <BackgroundParticles />
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"
      />
    </div>
  );

  if (!user) return (
    <div className="h-[100dvh] w-full bg-black relative overflow-hidden">
      <BackgroundParticles />
      <div className="relative z-10 h-full w-full">
        <Auth />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="h-[100dvh] w-full bg-black relative overflow-hidden">
      <BackgroundParticles />
      <div className="relative z-10 h-full w-full">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    </div>
  );

  const handleDeleteSession = async (sid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'sessions', sid));
      if (currentSessionId === sid) setCurrentSessionId(null);
      toast.success("Sync Purged");
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/sessions/${sid}`);
    }
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col transition-colors duration-700 overflow-hidden font-sans items-center justify-center p-0 sm:p-2 ${
      profile.matrixAesthetic === 'minimal' ? 'bg-slate-50 text-slate-900' : 
      profile.matrixAesthetic === 'void' ? 'bg-black text-white' : 'bg-background text-foreground'
    }`}>
      <BackgroundParticles color={
        profile.matrixAesthetic === 'minimal' ? '#cbd5e1' : 
        profile.matrixAesthetic === 'void' ? '#334155' : undefined
      } />
      <Toaster position="top-center" richColors theme={profile.matrixAesthetic === 'minimal' ? 'light' : 'dark'} />

      <div className="flex-grow flex flex-col w-full max-w-lg max-h-[850px] mx-auto shadow-2xl relative overflow-hidden bg-transparent border-x border-white/5 sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:my-2">
        {/* Header */}
        <header className={`flex-shrink-0 p-3 sm:p-4 px-3 sm:px-6 flex justify-between items-center z-50 transition-all duration-700 border-b backdrop-blur-3xl shadow-lg ${
          profile.matrixAesthetic === 'minimal' 
            ? 'bg-white/70 border-slate-100 shadow-slate-200/20 text-slate-900' 
            : 'bg-black/80 border-white/[0.05] shadow-black/30 text-white'
        }`}>
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <div className="relative group">
              <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-lg transition-all ${
                profile.matrixAesthetic === 'minimal' ? 'bg-slate-900 text-white shadow-none' : 
                profile.matrixAesthetic === 'void' ? 'bg-white text-black shadow-none' : 'bg-slate-950 border border-white/10 shadow-lg'
              }`}>
                S
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <h1 className={`font-black tracking-tighter text-lg sm:text-xl transition-colors italic ${
                profile.matrixAesthetic === 'minimal' ? 'text-slate-900' : 'text-white'
              }`}>SEKO</h1>
              <span className={`text-[7px] sm:text-[9px] font-black tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-colors opacity-60 ${
                profile.matrixAesthetic === 'minimal' ? 'text-slate-500' : 'text-pink-400'
              }`}>
                {profile.matrixAesthetic === 'void' ? 'VOID' : 'Premium OS'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <div className="flex items-center">
              <DropdownMenu>
                <MotionDropdownMenuTrigger
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all outline-none ${
                    profile.matrixAesthetic === 'minimal' ? 'text-slate-900' : 'text-pink-400 hover:text-pink-300'
                  }`}
                >
                  <Settings size={16} className="sm:w-[18px] sm:h-[18px] animate-spin-slow" />
                </MotionDropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-black/60 backdrop-blur-3xl border-white/[0.08] text-white p-3 mt-2 rounded-2xl shadow-2xl" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 p-2">System Protocols</DropdownMenuLabel>
                    
                    <DropdownMenuItem 
                      className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                      onClick={() => setShowRobotSettings(true)}
                    >
                      <Bot size={16} className="text-blue-400" />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase tracking-wider">Robot Forge</span>
                        <span className="text-[9px] text-slate-500">Chassis & Personality</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                      onClick={() => setShowVoiceSettings(true)}
                    >
                      <Mic2 size={16} className="text-pink-400" />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase tracking-wider">Voice Sync</span>
                        <span className="text-[9px] text-slate-500">Neural Synthesis</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                      onClick={() => setShowKeyboardSettings(true)}
                    >
                      <KeyboardIcon size={16} className="text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs uppercase tracking-wider">Glass Overlay</span>
                        <span className="text-[9px] text-slate-500">Input Matrix</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 p-2">Matrix Matrix</DropdownMenuLabel>
                    
                    <div className="grid grid-cols-3 gap-2 px-1 pb-1">
                      <button 
                        onClick={() => handleUpdateProfile({ matrixAesthetic: 'cyberpunk' })}
                        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all border ${profile.matrixAesthetic === 'cyberpunk' ? 'bg-pink-500/20 border-pink-500' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Cyber</span>
                      </button>
                      <button 
                        onClick={() => handleUpdateProfile({ matrixAesthetic: 'minimal' })}
                        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all border ${profile.matrixAesthetic === 'minimal' ? 'bg-slate-500/20 border-slate-400' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-slate-400" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Minimal</span>
                      </button>
                      <button 
                        onClick={() => handleUpdateProfile({ matrixAesthetic: 'void' })}
                        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all border ${profile.matrixAesthetic === 'void' ? 'bg-white/10 border-white/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">Void</span>
                      </button>
                    </div>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHistory(true)}
                className={`w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center transition-all ${
                  profile.matrixAesthetic === 'minimal' ? 'text-slate-900 border-l border-slate-100 ml-1' : 'text-white hover:text-slate-300 border-l border-white/5 ml-1'
                }`}
              >
                <History size={14} className="sm:w-[17px] sm:h-[17px]" />
              </motion.button>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPremium(true)}
              className={`px-3 sm:px-4 py-2 sm:py-2 text-[9px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.15em] flex items-center gap-1.5 transition-all duration-300 rounded-full border shrink-0 ${
                profile.matrixAesthetic === 'minimal' 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-pink-500/50 active:bg-pink-500/20'
              }`}
            >
              <Crown size={11} className="sm:w-[13px] sm:h-[13px] text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" /> 
              <span className="hidden xs:inline">
                {profile.matrixAesthetic === 'void' ? 'EVOLVE' : 'UPGRADE'}
              </span>
              <span className="xs:hidden">UP</span>
            </motion.button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/20 p-0.5 overflow-hidden transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg shadow-black/40 ring-1 ring-white/10">
                  <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative">
                    <img src={user.photoURL || `https://avatar.vercel.sh/${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-84 bg-black/60 backdrop-blur-3xl border-white/[0.08] text-white p-3 rounded-3xl shadow-2xl" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-3">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Human Identity</div>
                    <div className="font-bold text-lg leading-tight truncate text-white">
                      {profile.ghostProtocol ? 'Ghost Protocol' : (profile.name || 'Anonymous User')}
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate">
                      {profile.ghostProtocol ? '••••••••••••@••••.•••' : user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuItem 
                    className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                    onClick={() => setShowRobotSettings(true)}
                  >
                    <Bot size={16} className="text-blue-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs uppercase tracking-wider">Robot Forge</span>
                      <span className="text-[9px] text-slate-500">Chassis & Persona</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                    onClick={() => setShowVoiceSettings(true)}
                  >
                    <Mic2 size={16} className="text-pink-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs uppercase tracking-wider">Voice Settings</span>
                      <span className="text-[9px] text-slate-500">Neural Configuration</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                    onClick={() => setShowKeyboardSettings(true)}
                  >
                    <KeyboardIcon size={16} className="text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs uppercase tracking-wider">Keyboard Overlay</span>
                      <span className="text-[9px] text-slate-500">Custom Glass Layouts</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="p-3 focus:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3"
                    onClick={() => handleUpdateProfile({ matrixAesthetic: profile.matrixAesthetic === 'cyberpunk' ? 'minimal' : (profile.matrixAesthetic === 'minimal' ? 'void' : 'cyberpunk') })}
                  >
                    <Palette size={16} className={
                      profile.matrixAesthetic === 'minimal' ? 'text-white' : 
                      profile.matrixAesthetic === 'void' ? 'text-slate-600' : 'text-purple-400'
                    } />
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-xs uppercase tracking-wider">Matrix Aesthetic</span>
                      <span className="text-[9px] text-slate-500 capitalize">{profile.matrixAesthetic || 'cyberpunk'} Mode</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-none text-[8px] h-4">CYCLE</Badge>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-3 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                      <Brain size={12} className="text-purple-400" /> Neural Recalls
                    </div>
                    <Badge variant="outline" className="text-[8px] opacity-50 border-white/10">Recent</Badge>
                  </DropdownMenuLabel>
                  
                  <div className="px-2 pb-2 space-y-1 max-h-[200px] overflow-y-auto no-scrollbar">
                    {memories.length === 0 ? (
                      <div className="text-[9px] italic text-slate-500 px-2 py-2">SEKO is learning your patterns...</div>
                    ) : (
                      memories.map((m) => (
                        <div key={m.id} className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className={`w-1 h-1 rounded-full ${
                              m.category === 'preference' ? 'bg-pink-500' :
                              m.category === 'goal' ? 'bg-blue-500' : 'bg-emerald-500'
                            }`} />
                            <span className="text-[7px] font-black uppercase opacity-40">{m.category}</span>
                          </div>
                          <div className="text-[10px] text-slate-300 leading-tight">
                            <EmojiText text={m.content} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="p-3 focus:bg-pink-500/20 rounded-xl cursor-pointer flex items-center gap-3 text-pink-400"
                    onClick={() => auth.signOut()}
                  >
                    <LogOut size={16} />
                    <span className="font-bold text-xs uppercase tracking-widest">TERMINATE SESSION</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
          <div className="flex-grow relative overflow-hidden">
            <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden outline-none">
              <Chat 
                userProfile={profile} 
                sessionId={currentSessionId} 
                onSessionCreated={(id) => setCurrentSessionId(id)}
              />
            </TabsContent>
            
            <TabsContent value="dashboard" className="h-full m-0 overflow-y-auto data-[state=inactive]:hidden custom-scrollbar outline-none">
              <Dashboard userProfile={profile} />
            </TabsContent>

            <TabsContent value="journal" className="h-full m-0 overflow-y-auto data-[state=inactive]:hidden custom-scrollbar outline-none">
              <Journal userProfile={profile} />
            </TabsContent>
          </div>

          <TabsList className={`shrink-0 flex justify-center items-center h-16 backdrop-blur-3xl border-t transition-all duration-700 rounded-none p-0 ${
            profile.matrixAesthetic === 'minimal' ? 'bg-white/80 border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]' : 'bg-black/40 border-white/[0.05] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]'
          }`}>
            <TabsTrigger 
              value="dashboard" 
              className={`flex-1 h-full rounded-none transition-all group ${
                profile.matrixAesthetic === 'minimal' ? 'data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900' : 'data-[state=active]:bg-white/5 data-[state=active]:text-pink-400'
              }`}
            >
              <LayoutDashboard size={24} className={profile.matrixAesthetic === 'minimal' ? '' : 'group-data-[state=active]:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'} />
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className={`flex-1 h-full rounded-none transition-all group ${
                profile.matrixAesthetic === 'minimal' ? 'data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900' : 'data-[state=active]:bg-white/5 data-[state=active]:text-pink-400'
              }`}
            >
              <MessageSquare size={24} className={profile.matrixAesthetic === 'minimal' ? '' : 'group-data-[state=active]:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'} />
            </TabsTrigger>
            <TabsTrigger 
              value="journal" 
              className={`flex-1 h-full rounded-none transition-all group ${
                profile.matrixAesthetic === 'minimal' ? 'data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900' : 'data-[state=active]:bg-white/5 data-[state=active]:text-pink-400'
              }`}
            >
              <BookOpen size={24} className={profile.matrixAesthetic === 'minimal' ? '' : 'group-data-[state=active]:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>
      </div>

      {/* Premium Modal Overlay */}
      <AnimatePresence>
        {showPremium && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPremium(false)} />
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="glass max-w-sm w-full p-8 rounded-[2rem] border border-primary/20 relative overflow-hidden"
            >
              <div className="text-center">
                 <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto mb-6 flex items-center justify-center neon-glow">
                    <Crown size={32} className="text-white" />
                 </div>
                 <h2 className="text-3xl font-black mb-2 tracking-tighter">SEKO PREMIUM</h2>
                 <p className="text-muted-foreground text-sm mb-8">Unlock the full potential of your synthetic companion.</p>
                 
                 <ul className="space-y-3 text-left mb-8">
                    {['Unlimited Memory', 'Priority Neural Speed', 'Custom Robot Skins', 'Premium Voice Packs', 'Advanced Emotional Engine'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {f}
                      </li>
                    ))}
                 </ul>

                 <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent font-black tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                   ASCEND NOW - $9.99/MO
                 </Button>
                 <button onClick={() => setShowPremium(false)} className="mt-4 text-xs text-muted-foreground hover:text-white underline">Maybe in the next life</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot Settings Sheet */}
      <Sheet open={showRobotSettings} onOpenChange={setShowRobotSettings}>
        <SheetContent side="right" className="bg-black/60 backdrop-blur-3xl border-white/[0.05] text-white w-full sm:max-w-md p-6 overflow-y-auto shadow-2xl">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black text-white italic flex items-center gap-2">
              <Bot className="text-blue-400" /> ROBOT FORGE
            </SheetTitle>
            <SheetDescription className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              Chassis & Visual Configuration
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            {/* Skin Selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Chassis Skin</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'default', label: 'Classic', color: 'bg-slate-800' },
                  { id: 'chrome', label: 'Chrome', color: 'bg-slate-300' },
                  { id: 'gold', label: 'Gold', color: 'bg-yellow-500' },
                  { id: 'neon', label: 'Neon', color: 'bg-transparent border-white' },
                  { id: 'carbon', label: 'Carbon', color: 'bg-zinc-900' }
                ].map(skin => (
                  <button
                    key={skin.id}
                    onClick={() => handleUpdateProfile({ robotConfig: { ...profile.robotConfig, skin: skin.id } })}
                    className={`p-4 rounded-2xl border transition-all text-sm font-bold uppercase tracking-widest flex flex-col items-center gap-3 ${
                      profile.robotConfig?.skin === skin.id 
                        ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border border-white/20 ${skin.color}`} />
                    <span className="text-[10px]">{skin.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Palette Selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Energy Palette</Label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'purple', color: '#a855f7' },
                  { id: 'blue', color: '#3b82f6' },
                  { id: 'green', color: '#10b981' },
                  { id: 'red', color: '#ef4444' },
                  { id: 'yellow', color: '#f59e0b' },
                  { id: 'cyberpunk', color: '#ec4899' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleUpdateProfile({ robotConfig: { ...profile.robotConfig, palette: p.id } })}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      profile.robotConfig?.palette === p.id 
                        ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>

            <Button 
               onClick={() => setShowRobotSettings(false)}
               className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 font-bold tracking-widest"
            >
              FORGE ROBOT
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Voice Settings Sheet */}
      <Sheet open={showVoiceSettings} onOpenChange={setShowVoiceSettings}>
        <SheetContent side="right" className="bg-black/60 backdrop-blur-3xl border-white/[0.05] text-white w-full sm:max-w-md p-6 overflow-y-auto no-scrollbar shadow-2xl">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black text-white italic flex items-center gap-2">
              <Mic2 className="text-pink-400" /> VOICE SETTINGS
            </SheetTitle>
            <SheetDescription className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              Neural Configuration Protocol V2.4
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            {/* Gender Selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Voice Channel</Label>
              <div className="grid grid-cols-2 gap-3">
                {['female', 'male'].map(g => (
                  <button
                    key={g}
                    onClick={() => handleUpdateProfile({ 
                      robotConfig: { 
                        ...profile.robotConfig, 
                        voiceGender: g,
                        language: g === 'female' ? 'en-US' : 'en-GB'
                      } 
                    })}
                    className={`py-4 flex flex-col items-center gap-2 transition-all ${
                      profile.robotConfig?.voiceGender === g 
                        ? 'text-pink-500 scale-110' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {g === 'female' ? <AppleEmoji emoji="✨" size={32} /> : <AppleEmoji emoji="🌗" size={32} />}
                    <div className="flex flex-col items-center">
                      <span className="font-black text-[10px] uppercase tracking-[0.2em]">{g}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Linguistic Mood</Label>
              <div className="grid grid-cols-2 gap-3">
                {moods.map(m => (
                  <button
                    key={m.id}
                    disabled={m.premium && !profile.premium}
                    onClick={() => handleUpdateProfile({ moodPreference: m.id })}
                    className={`p-2 transition-all flex items-center gap-3 relative ${
                      profile.moodPreference === m.id 
                        ? 'text-white scale-105' 
                        : 'text-slate-500 hover:text-slate-300'
                    } ${m.premium && !profile.premium ? 'opacity-30 grayscale' : ''}`}
                  >
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                      {m.icon} {m.label}
                    </div>
                    {m.premium && !profile.premium && (
                      <Crown size={10} className="text-pink-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Linguistic Protocol</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
                  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
                  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
                  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
                  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
                  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleUpdateProfile({ 
                      robotConfig: { 
                        ...profile.robotConfig, 
                        language: l.code
                      } 
                    })}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      profile.robotConfig?.language === l.code 
                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{l.flag}</span>
                      <span className="font-black text-[10px] uppercase tracking-widest">{l.label}</span>
                    </div>
                    {profile.robotConfig?.language === l.code && <div className="w-2 h-2 rounded-full bg-blue-500 neon-glow" />}
                  </button>
                ))}
              </div>
            </div>

            <Button 
               onClick={() => setShowVoiceSettings(false)}
               className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-blue-500 font-bold tracking-widest"
            >
              SAVE PROTOCOLS
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      {/* Keyboard Settings Sheet */}
      <Sheet open={showKeyboardSettings} onOpenChange={setShowKeyboardSettings}>
        <SheetContent side="right" className="bg-black/60 backdrop-blur-3xl border-white/[0.05] text-white w-full sm:max-w-md p-6 overflow-y-auto no-scrollbar shadow-2xl">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black text-white italic flex items-center gap-2">
              <KeyboardIcon className="text-emerald-400" /> KEYBOARD PROTOCOLS
            </SheetTitle>
            <SheetDescription className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              Visual Input Interface Config
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            {/* Color Selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Aura Color</Label>
              <div className="flex flex-wrap gap-3">
                {['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleUpdateProfile({ keyboardConfig: { ...profile.keyboardConfig, color: c } })}
                    className={`w-10 h-10 rounded-full border-2 transition-all p-1 ${
                      profile.keyboardConfig?.color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: c }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Layout selection */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Grid Layout</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'default', label: '6xAuto', icon: <LayoutIcon size={16} /> },
                  { id: 'compact', label: '8xAuto', icon: <LayoutIcon size={16} className="scale-75" /> },
                  { id: 'wide', label: '10xAuto', icon: <LayoutIcon size={16} className="scale-x-125" /> }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleUpdateProfile({ keyboardConfig: { ...profile.keyboardConfig, layout: l.id } })}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                      profile.keyboardConfig?.layout === l.id 
                        ? 'bg-emerald-500/20 border-emerald-500 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    {l.icon}
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glass Intensity */}
            <div className="space-y-4">
              <Label className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-bold">Glass Opacity</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', label: 'Soft', icon: <Layers size={14} className="opacity-30" /> },
                  { id: 'medium', label: 'Neural', icon: <Layers size={14} className="opacity-60" /> },
                  { id: 'high', label: 'Cyber', icon: <Layers size={14} className="opacity-100" /> }
                ].map(i => (
                  <button
                    key={i.id}
                    onClick={() => handleUpdateProfile({ keyboardConfig: { ...profile.keyboardConfig, glassIntensity: i.id } })}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                      profile.keyboardConfig?.glassIntensity === i.id 
                        ? 'bg-emerald-500/20 border-emerald-500 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    {i.icon}
                    {i.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
               onClick={() => setShowKeyboardSettings(false)}
               className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest transition-colors"
            >
              COMMIT KEYBOARD PROTOCOL
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      {/* Neural History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="left" className="bg-black/60 backdrop-blur-3xl border-white/[0.05] text-white w-full sm:max-w-md p-6 overflow-y-auto no-scrollbar shadow-2xl">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black text-white italic flex items-center gap-2">
              <History className="text-purple-400" /> NEURAL HISTORY
            </SheetTitle>
            <SheetDescription className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              Stored Synchronization Sessions
            </SheetDescription>
          </SheetHeader>

          <Button 
            onClick={() => {
              setCurrentSessionId(null);
              setShowHistory(false);
              toast.info("New Synchronization Initialized");
            }}
            className="w-full h-14 mb-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black tracking-widest flex items-center gap-2 hover:bg-white/10"
          >
            <Plus size={20} className="text-pink-500" /> NEW SYNC
          </Button>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center opacity-30">
                <Brain size={48} className="mb-4" />
                <p className="text-xs font-bold tracking-widest uppercase">Neural Matrix Empty</p>
                <p className="text-[10px] mt-2">Begin a conversation to start recording history.</p>
              </div>
            ) : (
              sessions.map((s) => (
                <div 
                  key={s.id}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentSessionId === s.id 
                      ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20' 
                      : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20'
                  }`}
                  onClick={() => {
                    setCurrentSessionId(s.id);
                    setShowHistory(false);
                  }}
                >
                  <div className="flex flex-col gap-1 pr-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={10} className="text-slate-500" />
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                        {s.updatedAt?.toDate?.() ? new Date(s.updatedAt.toDate()).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm leading-tight truncate">
                      {s.title || 'Untitled Session'}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate opacity-60">
                      {s.lastMessage || 'No messages yet...'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(s.id);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

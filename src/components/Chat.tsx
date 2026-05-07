import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Mic, Sparkles, Brain, ChevronDown, ChevronUp, Smile, Type } from 'lucide-react';
import { chatWithSEKO, extractMemories } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Robot } from './Robot';
import { EmojiText, AppleEmoji } from './GlassUI';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { EmojiKeyboard } from './EmojiKeyboard';
import { NeuralKeyboard } from './NeuralKeyboard';

export const Chat: React.FC<{ userProfile?: any; sessionId?: string | null; onSessionCreated?: (id: string) => void }> = ({ userProfile, sessionId, onSessionCreated }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking' | 'listening'>('idle');
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [showNeuralKeyboard, setShowNeuralKeyboard] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser || !sessionId) {
      setMessages([]);
      return;
    }

    // Listen for messages in the specific session
    const messagesPath = `users/${auth.currentUser.uid}/sessions/${sessionId}/messages`;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, messagesPath);
    });

    // Listen for memories
    const memoriesPath = `users/${auth.currentUser.uid}/memories`;
    const mq = query(collection(db, 'users', auth.currentUser.uid, 'memories'), orderBy('timestamp', 'desc'));
    const unsubscribeMemories = onSnapshot(mq, (snapshot) => {
      setMemories(snapshot.docs.map(doc => doc.data()));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, memoriesPath);
    });

    return () => {
      unsubscribe();
      unsubscribeMemories();
    };
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || !auth.currentUser) return;

    const userMsg = input;
    const userId = auth.currentUser.uid;
    setInput('');
    setStatus('thinking');

    let activeSessionId = sessionId;

    try {
      // 1. If no session exists, create one
      if (!activeSessionId) {
        const sessionRef = await addDoc(collection(db, 'users', userId, 'sessions'), {
          userId,
          title: userMsg.slice(0, 40) + (userMsg.length > 40 ? '...' : ''),
          lastMessage: userMsg,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        activeSessionId = sessionRef.id;
        if (onSessionCreated) onSessionCreated(activeSessionId);
      }

      // 2. Add user message to session
      await addDoc(collection(db, 'users', userId, 'sessions', activeSessionId, 'messages'), {
        role: 'user',
        content: userMsg,
        timestamp: serverTimestamp(),
      });
      
      // Update session's last message and updatedAt
      await setDoc(doc(db, 'users', userId, 'sessions', activeSessionId), {
        lastMessage: userMsg,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/sessions/${activeSessionId}/messages`);
    }

    try {
      // 3. Get AI response with memories context
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      
      const response = await chatWithSEKO(userMsg, history as any, userProfile, memories);

      // 4. Add AI message to session
      if (activeSessionId) {
        await addDoc(collection(db, 'users', userId, 'sessions', activeSessionId, 'messages'), {
          role: 'assistant',
          content: response,
          timestamp: serverTimestamp(),
        });

        await setDoc(doc(db, 'users', userId, 'sessions', activeSessionId), {
          lastMessage: response,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // 4. Background Memory Extraction (don't wait for UI update)
      extractMemories(userMsg, response).then(async (newMemories) => {
        for (const m of newMemories) {
          try {
            await addDoc(collection(db, 'users', userId, 'memories'), {
              ...m,
              userId,
              timestamp: serverTimestamp(),
              importance: 1
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${userId}/memories`);
          }
        }
      }).catch(err => console.error("Memory extraction failed:", err));

      setStatus('speaking');
      
      // Voice synthesis (Speech)
      const utterance = new SpeechSynthesisUtterance();
      
      // Remove emojis from the text so they aren't called out by name
      const cleanText = response.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, '');
      utterance.text = cleanText;
      
      // Set language from profile
      utterance.lang = userProfile?.robotConfig?.language || 'en-US';

      // Select voice based on gender preference
      const voices = window.speechSynthesis.getVoices();
      const preferredGender = userProfile?.robotConfig?.voiceGender || 'female';
      const targetLang = userProfile?.robotConfig?.language || (preferredGender === 'female' ? 'en-US' : 'en-GB');
      
      // Try to find a voice matching the gender and targeted locale
      const selectedVoice = voices.find(v => {
        const matchesLocale = v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase();
        const isMale = v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('arthur') || v.name.toLowerCase().includes('google uk english male');
        const isFemale = v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('google us english');
        
        if (preferredGender === 'male') {
          return matchesLocale && isMale;
        } else {
          return matchesLocale && isFemale;
        }
      }) || voices.find(v => {
        // Fallback to just locale
        return v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase();
      }) || voices.find(v => {
        // Fallback to gender and broad language
        const matchesLang = v.lang.startsWith(targetLang.split('-')[0]);
        const isMale = v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel');
        const isFemale = v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha');
        return matchesLang && (preferredGender === 'male' ? isMale : isFemale);
      }) || voices[0];
      
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = selectedVoice?.lang || targetLang;

      utterance.onend = () => setStatus('idle');
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setStatus('listening');
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setStatus('idle');
    };
    recognition.onerror = () => setStatus('idle');
    recognition.start();
  };

  const isMinimal = userProfile?.matrixAesthetic === 'minimal';
  const isVoid = userProfile?.matrixAesthetic === 'void';
  const keyboardConfig = userProfile?.keyboardConfig || { color: '#ec4899', layout: 'default', glassIntensity: 'medium' };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden relative transition-all duration-300 ease-in-out ${showNeuralKeyboard ? 'p-0' : 'p-2 sm:p-4 gap-2 sm:gap-4'}`}>
      <div 
        className={`flex-grow p-4 transition-all duration-500 relative z-10 ${
          showNeuralKeyboard ? 'rounded-none border-0' : 'rounded-[2.5rem] border mb-3 sm:mb-4'
        } ${
          isMinimal ? 'bg-white border-slate-100 shadow-slate-100/50' : 'bg-white/[0.02] backdrop-blur-2xl border-white/[0.05] shadow-black/20'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex flex-col gap-4 min-h-full justify-end relative">
          {/* Neural Controls - Shifted to side floating dock */}
          <div className="absolute top-[20%] right-2 flex flex-col gap-3 z-20">
            <motion.button
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const newAesthetic = isMinimal ? 'default' : 'minimal';
                if (auth.currentUser) {
                  setDoc(doc(db, 'users', auth.currentUser.uid), { matrixAesthetic: newAesthetic }, { merge: true });
                }
              }}
              className={`p-3 rounded-2xl border transition-all shadow-xl backdrop-blur-3xl ${
                isMinimal ? 'bg-white border-slate-200 text-slate-500' : 'bg-black/40 border-white/10 text-pink-400 shadow-pink-500/10'
              }`}
            >
              <Sparkles size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-2xl border transition-all shadow-xl backdrop-blur-3xl ${
                isMinimal ? 'bg-white border-slate-200 text-slate-500' : 'bg-black/40 border-white/10 text-blue-400 shadow-blue-500/10'
              }`}
            >
              <Brain size={18} />
            </motion.button>
          </div>

          <div className="flex flex-col items-center gap-1 mb-8 opacity-80">
            <div className={`w-8 h-1 rounded-full mb-1 ${isMinimal ? 'bg-slate-200' : 'bg-white/10'}`} />
            <Robot status={status} config={userProfile?.robotConfig} />
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                layout
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-xl border backdrop-blur-3xl transition-all duration-700 ${
                    msg.role === 'user' 
                      ? (
                        isMinimal ? 'bg-slate-950 text-white rounded-tr-none border-slate-900' :
                        isVoid ? 'bg-white text-black rounded-tr-none border-white shadow-none' :
                        'bg-white/95 border-white/20 text-black rounded-tr-none shadow-pink-500/5'
                      )
                      : (
                        isMinimal ? 'bg-slate-100 text-slate-900 rounded-tl-none border-slate-200/50 shadow-sm' :
                        isVoid ? 'bg-zinc-900 text-white rounded-tl-none border-zinc-800 shadow-none' :
                        'bg-white/80 border-white/[0.08] text-black rounded-tl-none shadow-black/10'
                      )
                  }`}
                  style={{
                    boxShadow: msg.role === 'user' && !isMinimal && !isVoid ? '0 10px 40px -10px rgba(236, 72, 153, 0.1), inset 0 1px 1px rgba(255,255,255,0.2)' : undefined
                  }}
                >
                  <EmojiText text={msg.content} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} className="h-2 w-full shrink-0" />
        </div>
      </div>

      <div className={`flex flex-col gap-2 items-center transition-all duration-300 ease-in-out relative z-20 ${
        showNeuralKeyboard ? 'rounded-none border-x-0 border-b-0 border-t border-white/5 pb-2 mb-0 bg-black/40 backdrop-blur-3xl' : 'rounded-[2.2rem] p-2 sm:p-2.5 border mb-2 sm:mb-3 ' + (isMinimal ? 'bg-white border-slate-100 shadow-xl shadow-slate-200/40' : 'bg-black/20 backdrop-blur-3xl border-white/[0.08] shadow-2xl shadow-black/40')
      }`}>
        {!showNeuralKeyboard && <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full ${isMinimal ? 'bg-slate-200' : 'bg-white/10 opacity-50'}`} />}
        
        <div className={`flex w-full gap-2.5 items-center ${showNeuralKeyboard ? 'px-4 py-2' : 'px-1.5'}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-11 h-11 transition-all active:scale-90 shrink-0 hover:bg-transparent ${
              isMinimal ? 'text-slate-900 hover:text-slate-600' : 'text-pink-400 hover:text-pink-300'
            }`}
            onClick={startVoice}
          >
            <Mic size={22} className={status === 'listening' ? 'animate-pulse' : ''} />
          </Button>
          
          <div 
            className="flex-1 relative group flex items-center cursor-pointer"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowNeuralKeyboard(true);
              setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
            }}
          >
            <button
               onPointerDown={(e) => {
                 e.preventDefault();
                 setShowNeuralKeyboard(!showNeuralKeyboard);
               }}
               className="absolute left-3 p-2 transition-colors z-10 hover:scale-110 active:scale-95"
            >
              <Type size={18} className={showNeuralKeyboard ? 'text-pink-500' : 'text-slate-400'} />
            </button>
            <div 
              className={`flex-1 h-11 sm:h-12 flex items-center border-none rounded-[1.5rem] italic text-[15px] sm:text-base pl-12 pr-6 shadow-inner transition-all select-none ${
                isMinimal ? 'bg-slate-50 text-slate-900' : 'bg-white text-black'
              }`}
            >
              {input || <span className="text-slate-500 opacity-60">Transmit neural signals...</span>}
            </div>
          </div>

          <Button 
            onClick={handleSend}
            size="icon" 
            disabled={!input.trim()}
            className={`w-11 h-11 rounded-full transition-all disabled:opacity-50 disabled:grayscale shrink-0 ${
              isMinimal ? 'bg-slate-900 shadow-slate-200 shadow-lg' : 'bg-gradient-to-tr from-pink-500 to-blue-500 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 active:scale-95'
            }`}
          >
            <Send size={20} className="text-white ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Neural Keyboard - Direct sibling for proper layout pushing */}
      <AnimatePresence>
        {showNeuralKeyboard && (
          <NeuralKeyboard 
            config={{ color: keyboardConfig.color }}
            onInput={(char) => {
              setInput(prev => prev + char);
              // Scroll to bottom on input
              setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            }}
            onDelete={() => {
              setInput(prev => {
                const arr = Array.from(prev);
                if (arr.length === 0) return '';
                return arr.slice(0, -1).join('');
              });
            }}
            onEnter={() => {
              handleSend();
            }}
            onClose={() => setShowNeuralKeyboard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
